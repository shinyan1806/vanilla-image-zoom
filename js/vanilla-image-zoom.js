(function () {
  "use strict";

  var OFFSET = 80;
  var SCROLL_CLOSE_DELTA = 40;
  var TOUCH_CLOSE_DELTA = 10;
  var TRANSITION_DURATION_MS = 300;

  function stopEvent(event) {
    if (!event) return;
    if (typeof event.preventDefault === "function") event.preventDefault();
    if (typeof event.stopPropagation === "function") event.stopPropagation();
    event.cancelBubble = true;
  }

  function getZoomImage(target) {
    if (!target || target.nodeType !== 1) return null;
    var image = target.closest("img[data-action='zoom']");
    return image && image.tagName === "IMG" ? image : null;
  }

  function Zoom(image) {
    this.image = image;
    this.clone = null;
    this.overlay = null;
    this.width = 0;
    this.height = 0;
  }

  Zoom.prototype.open = function () {
    this.calculateSize();

    this.clone = this.image.cloneNode(false);
    this.clone.removeAttribute("id");
    this.clone.removeAttribute("style");
    this.clone.className = "zoom-img";
    this.clone.setAttribute("data-action", "zoom-out");
    this.clone.style.width = this.width + "px";
    this.clone.style.height = this.height + "px";
    this.clone.style.left = (window.innerWidth - this.width) / 2 + "px";
    this.clone.style.top = (window.innerHeight - this.height) / 2 + "px";
    this.clone.style.transform = this.originTransform();

    this.overlay = document.createElement("div");
    this.overlay.className = "zoom-overlay";

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.clone);
    this.image.style.visibility = "hidden";

    void this.clone.offsetWidth;

    this.clone.style.transform = "";
    document.body.classList.add("zoom-overlay-open");
  };

  Zoom.prototype.calculateSize = function () {
    var rect = this.image.getBoundingClientRect();
    var naturalWidth = this.image.naturalWidth || rect.width;
    var naturalHeight = this.image.naturalHeight || rect.height;
    var scale = Math.min(
      1,
      (window.innerWidth - OFFSET) / naturalWidth,
      (window.innerHeight - OFFSET) / naturalHeight
    );

    this.width = naturalWidth * scale;
    this.height = naturalHeight * scale;
  };

  Zoom.prototype.originTransform = function () {
    var rect = this.image.getBoundingClientRect();
    var translateX = rect.left + rect.width / 2 - window.innerWidth / 2;
    var translateY = rect.top + rect.height / 2 - window.innerHeight / 2;
    var scale = rect.width / this.width;

    return "translate(" + translateX + "px, " + translateY + "px) scale(" + scale + ")";
  };

  Zoom.prototype.close = function () {
    var self = this;
    var finished = false;

    document.body.classList.remove("zoom-overlay-open");
    document.body.classList.add("zoom-overlay-transitioning");

    this.clone.style.transform = this.originTransform();

    function finish() {
      if (finished) return;
      finished = true;
      self.clone.removeEventListener("transitionend", finish);
      self.dispose();
    }

    this.clone.addEventListener("transitionend", finish);
    window.setTimeout(finish, TRANSITION_DURATION_MS + 50);
  };

  Zoom.prototype.dispose = function () {
    this.image.style.visibility = "";

    if (this.clone && this.clone.parentNode) {
      this.clone.parentNode.removeChild(this.clone);
    }
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    document.body.classList.remove("zoom-overlay-transitioning");
  };

  function ZoomService() {
    this.activeZoom = null;
    this.initialScrollPosition = null;
    this.initialTouchPosition = null;
    this.touchMoveTarget = null;

    this.onBodyClick = this.onBodyClick.bind(this);
    this.onWindowScroll = this.onWindowScroll.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onDocumentKeyup = this.onDocumentKeyup.bind(this);
    this.onDocumentTouchStart = this.onDocumentTouchStart.bind(this);
    this.onDocumentCaptureClick = this.onDocumentCaptureClick.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
  }

  ZoomService.prototype.listen = function () {
    document.body.addEventListener("click", this.onBodyClick);
  };

  ZoomService.prototype.onBodyClick = function (event) {
    var image = getZoomImage(event.target);
    if (!image) return;
    if (this.activeZoom) return;

    stopEvent(event);

    this.activeZoom = new Zoom(image);
    this.activeZoom.open();

    window.addEventListener("scroll", this.onWindowScroll, { passive: true });
    window.addEventListener("resize", this.onWindowResize);
    document.addEventListener("keyup", this.onDocumentKeyup);
    document.addEventListener("touchstart", this.onDocumentTouchStart, { passive: true });
    document.addEventListener("click", this.onDocumentCaptureClick, true);
  };

  ZoomService.prototype.closeActiveZoom = function () {
    if (!this.activeZoom) return;

    this.removeListeners();

    var zoom = this.activeZoom;
    this.activeZoom = null;
    this.initialScrollPosition = null;
    this.initialTouchPosition = null;
    this.touchMoveTarget = null;

    zoom.close();
  };

  ZoomService.prototype.removeListeners = function () {
    window.removeEventListener("scroll", this.onWindowScroll);
    window.removeEventListener("resize", this.onWindowResize);
    document.removeEventListener("keyup", this.onDocumentKeyup);
    document.removeEventListener("touchstart", this.onDocumentTouchStart);
    document.removeEventListener("click", this.onDocumentCaptureClick, true);

    if (this.touchMoveTarget) {
      this.touchMoveTarget.removeEventListener("touchmove", this.onTouchMove);
    }
  };

  ZoomService.prototype.onWindowScroll = function () {
    if (!this.activeZoom) return;

    if (this.initialScrollPosition === null) {
      this.initialScrollPosition = window.scrollY;
    }

    if (Math.abs(this.initialScrollPosition - window.scrollY) >= SCROLL_CLOSE_DELTA) {
      this.closeActiveZoom();
    }
  };

  ZoomService.prototype.onWindowResize = function () {
    this.closeActiveZoom();
  };

  ZoomService.prototype.onDocumentKeyup = function (event) {
    if (!this.activeZoom) return;

    if (event.key === "Escape" || event.keyCode === 27) {
      this.closeActiveZoom();
    }
  };

  ZoomService.prototype.onDocumentTouchStart = function (event) {
    if (!this.activeZoom || !event.touches || !event.touches.length) return;

    this.initialTouchPosition = event.touches[0].pageY;
    this.touchMoveTarget = event.target;

    if (this.touchMoveTarget && this.touchMoveTarget.addEventListener) {
      this.touchMoveTarget.addEventListener("touchmove", this.onTouchMove, { passive: true });
    }
  };

  ZoomService.prototype.onTouchMove = function (event) {
    if (!this.activeZoom || !event.touches || !event.touches.length) return;

    if (Math.abs(event.touches[0].pageY - this.initialTouchPosition) > TOUCH_CLOSE_DELTA) {
      this.closeActiveZoom();
    }
  };

  ZoomService.prototype.onDocumentCaptureClick = function (event) {
    if (!this.activeZoom) return;
    stopEvent(event);
    this.closeActiveZoom();
  };

  function initialize() {
    if (!document.body) return;
    new ZoomService().listen();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
