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
    this.imageWrap = null;
    this.overlay = null;
    this.scaleFactor = 1;
  }

  Zoom.prototype.open = function () {
    this.imageWrap = document.createElement("div");
    this.imageWrap.className = "zoom-img-wrap";

    this.image.parentNode.insertBefore(this.imageWrap, this.image);
    this.imageWrap.appendChild(this.image);

    this.image.classList.add("zoom-img");
    this.image.setAttribute("data-action", "zoom-out");

    this.overlay = document.createElement("div");
    this.overlay.className = "zoom-overlay";
    document.body.appendChild(this.overlay);

    this.calculateZoom();
    this.applyZoom();
  };

  Zoom.prototype.calculateZoom = function () {
    var imageWidth = this.image.width;
    var naturalWidth = this.image.naturalWidth || imageWidth;
    var naturalHeight = this.image.naturalHeight || this.image.height;
    var maxScaleFactor = naturalWidth / imageWidth;
    var viewportHeight = window.innerHeight - OFFSET;
    var viewportWidth = window.innerWidth - OFFSET;
    var imageAspectRatio = naturalWidth / naturalHeight;
    var viewportAspectRatio = viewportWidth / viewportHeight;

    if (naturalWidth < viewportWidth && naturalHeight < viewportHeight) {
      this.scaleFactor = maxScaleFactor;
    } else if (imageAspectRatio < viewportAspectRatio) {
      this.scaleFactor = (viewportHeight / naturalHeight) * maxScaleFactor;
    } else {
      this.scaleFactor = (viewportWidth / naturalWidth) * maxScaleFactor;
    }
  };

  Zoom.prototype.applyZoom = function () {
    void this.image.offsetWidth;

    var rect = this.image.getBoundingClientRect();
    var viewportY = window.scrollY + window.innerHeight / 2;
    var viewportX = window.innerWidth / 2;
    var imageCenterY = window.scrollY + rect.top + rect.height / 2;
    var imageCenterX = rect.left + rect.width / 2;
    var translateY = viewportY - imageCenterY;
    var translateX = viewportX - imageCenterX;

    this.image.style.transform = "scale(" + this.scaleFactor + ")";
    this.imageWrap.style.transform =
      "translate(" + translateX + "px, " + translateY + "px) translateZ(0)";

    document.body.classList.add("zoom-overlay-open");
  };

  Zoom.prototype.close = function (done) {
    var self = this;
    var finished = false;

    document.body.classList.remove("zoom-overlay-open");
    document.body.classList.add("zoom-overlay-transitioning");

    this.image.style.transform = "";
    this.imageWrap.style.transform = "";

    function finish() {
      if (finished) return;
      finished = true;
      self.image.removeEventListener("transitionend", finish);
      self.dispose();
      done();
    }

    this.image.addEventListener("transitionend", finish);
    window.setTimeout(finish, TRANSITION_DURATION_MS + 50);
  };

  Zoom.prototype.dispose = function () {
    if (!this.imageWrap || !this.imageWrap.parentNode) return;

    this.image.classList.remove("zoom-img");
    this.image.setAttribute("data-action", "zoom");
    this.imageWrap.parentNode.replaceChild(this.image, this.imageWrap);

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

    zoom.close(function () {});
  };

  ZoomService.prototype.removeListeners = function () {
    window.removeEventListener("scroll", this.onWindowScroll);
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
