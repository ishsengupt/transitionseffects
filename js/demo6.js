/**
 * demo6.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2019, Codrops
 * http://www.codrops.com
 */
{
  // body element
  const body = document.body;

  // helper functions
  const MathUtils = {
    // linear interpolation
    absdisplacement: (x1, x2) => Math.abs(x1 - x2),
    displacement: (x1, x2) => Math.sign(x1 - x2),
    lerp: (a, b, n) => (1 - n) * a + n * b,
    // distance between two points
    distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    percentage: (x1, x2) => x1 / x2
  };

  // get the mouse position
  const getMousePos = ev => {
    let posx = 0;
    let posy = 0;

    if (!ev) ev = window.event;
    // console.log("offsetX" + ev.offsetX);
    //console.log("offsetY" + ev.offsetY);
    //console.log(window.innerWidth);
    //console.log(window.innerHeight);
    if (ev.pageX || ev.pageY) {
      posx = ev.pageX;
      posy = ev.pageY;
    } else if (ev.clientX || ev.clientY) {
      posx = ev.clientX + body.scrollLeft + docEl.scrollLeft;
      posy = ev.clientY + body.scrollTop + docEl.scrollTop;
    }
    return {
      x: posx,
      y: posy,
      offx: ev.offsetX,
      offy: ev.offsetY,
      windowwidth: window.innerWidth,
      windowheight: window.innerHeight
    };
  };

  // mousePos: current mouse position
  // lastMousePos: last last recorded mouse position (at the time the last image was shown)
  let mousePos = (lastMousePos = { x: 0, y: 0 });

  // update the mouse position
  window.addEventListener("mousemove", ev => (mousePos = getMousePos(ev)));

  // gets the distance from the current mouse position to the last recorded mouse position
  const getMouseDistance = () =>
    MathUtils.distance(mousePos.x, mousePos.y, lastMousePos.x, lastMousePos.y);

  const getWidthPerc = () =>
    MathUtils.percentage(mousePos.offx, mousePos.windowwidth);

  const getHeightPerc = () =>
    MathUtils.percentage(mousePos.offy, mousePos.windowheight);

  class Image {
    constructor(el) {
      this.DOM = { el: el };
      // image deafult styles
      this.defaultStyle = {
        x: 0,
        y: 0,
        opacity: 1
      };
      // get sizes/position
      this.getRect();
      // init/bind events
      this.initEvents();
    }
    initEvents() {
      // on resize get updated sizes/position
      window.addEventListener("resize", () => this.resize());
    }
    resize() {
      console.log(this.DOM.el);
      // reset styles
      TweenMax.set(this.DOM.el, this.defaultStyle);
      // get sizes/position
      this.getRect();
    }
    getRect() {
      console.log(this.DOM.el.getBoundingClientRect());
      this.rect = this.DOM.el.getBoundingClientRect();
    }
  }

  class ImageTrail {
    constructor() {
      // images container
      this.DOM = {
        content: document.querySelector(".mainmenu > .image-content"),
        svg: document.querySelector("svg.distort")
        // The menu element
      };
      // array of Image objs, one per image element
      /*   this.images = [];
      [...this.DOM.content.querySelectorAll("div.left__img")].forEach(img =>
        this.images.push(new Image(img))
      ); */

      this.images = [];
      [...this.DOM.content.querySelectorAll("div.left__img")].forEach(img =>
        this.images.push(new Image(img))
      );

      this.otherimages = [];
      [...this.DOM.content.querySelectorAll("div.right__img")].forEach(img =>
        this.otherimages.push(new Image(img))
      );

      this.downimages = [];
      [...this.DOM.content.querySelectorAll("div.down__img")].forEach(img =>
        this.downimages.push(new Image(img))
      );

      this.upimages = [];
      [...this.DOM.content.querySelectorAll("div.up__img")].forEach(img =>
        this.upimages.push(new Image(img))
      );

      // total number of images
      this.imagesTotal = this.otherimages.length;
      this.otherimagesTotal = this.otherimages.length;
      // upcoming image index
      this.imgPosition = 0;
      // zIndex value to apply to the upcoming image
      this.zIndexVal = 1;
      // mouse distance required to show the next image
      this.threshold = 100;
      this.dmScale = 0;
      this.showNextImage();

      // render the images
      requestAnimationFrame(() => this.render());
    }
    render() {
      // get distance between the current mouse position and the position of the previous image
      let distance = getMouseDistance();
      let widthperc = getWidthPerc();
      let heightperc = getHeightPerc();

      // if the mouse moved more than [this.threshold] then show the next image

      if (distance > this.threshold && widthperc > 0.75 && heightperc < 0.25) {
        this.showOtherNextImage();
      } else if (
        distance > this.threshold &&
        widthperc < 0.75 &&
        heightperc < 0.5 &&
        heightperc > 0.25
      ) {
        this.showNextImage();
      } else if (
        distance > this.threshold &&
        widthperc < 0.75 &&
        heightperc < 0.75 &&
        heightperc > 0.5
      ) {
        this.showdownNextImage();
      } else if (
        distance > this.threshold &&
        widthperc < 0.75 &&
        heightperc < 1.0 &&
        heightperc > 0.75
      ) {
        this.showupNextImage();
      }

      // loop..
      requestAnimationFrame(() => this.render());
    }

    showupNextImage() {
      // show image at position [this.imgPosition]
      const img = this.upimages[this.imgPosition];
      // kill any tween on the image
      TweenMax.killTweensOf(img.DOM.el);

      new TimelineMax()
        // show the image
        .set(
          img.DOM.el,
          {
            opacity: 1,
            x: mousePos.x > lastMousePos.x ? 100 : -100,
            zIndex: this.zIndexVal
          },
          0
        )
        // animate position
        .to(
          img.DOM.el,
          1.2,
          {
            ease: Expo.easeOut,
            x: 0
          },
          0
        );

      ++this.zIndexVal;
      this.imgPosition =
        this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;

      lastMousePos = mousePos;
    }

    showdownNextImage() {
      // show image at position [this.imgPosition]
      const img = this.downimages[this.imgPosition];
      // kill any tween on the image
      TweenMax.killTweensOf(img.DOM.el);

      new TimelineMax()
        // show the image
        .set(
          img.DOM.el,
          {
            opacity: 1,
            x: mousePos.x > lastMousePos.x ? 100 : -100,
            zIndex: this.zIndexVal
          },
          0
        )
        // animate position
        .to(
          img.DOM.el,
          1.2,
          {
            ease: Expo.easeOut,
            x: 0
          },
          0
        );

      ++this.zIndexVal;
      this.imgPosition =
        this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;

      lastMousePos = mousePos;
    }

    showOtherNextImage() {
      // show image at position [this.imgPosition]
      const img = this.otherimages[this.imgPosition];
      // kill any tween on the image
      TweenMax.killTweensOf(img.DOM.el);

      new TimelineMax()
        // show the image
        .set(
          img.DOM.el,
          {
            opacity: 1,
            x: mousePos.x > lastMousePos.x ? 100 : -100,
            zIndex: this.zIndexVal
          },
          0
        )
        // animate position
        .to(
          img.DOM.el,
          1.2,
          {
            ease: Expo.easeOut,
            x: 0
          },
          0
        );

      ++this.zIndexVal;
      this.imgPosition =
        this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;

      lastMousePos = mousePos;
    }

    showNextImage() {
      //console.log(this.images);
      // show image at position [this.imgPosition]
      const img = this.images[this.imgPosition];
      // kill any tween on the image
      TweenMax.killTweensOf(img.DOM.el);

      new TimelineMax()
        // show the image
        .set(
          img.DOM.el,
          {
            opacity: 1,
            x: mousePos.x > lastMousePos.x ? 100 : -100,
            zIndex: this.zIndexVal
          },
          0
        )
        // animate position
        .to(
          img.DOM.el,
          1.2,
          {
            ease: Expo.easeOut,
            x: 0
          },
          0
        );

      ++this.zIndexVal;
      this.imgPosition =
        this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;

      lastMousePos = mousePos;
    }
  }

  /***********************************/
  /********** Preload stuff **********/

  // Preload images
  const preloadImages = () => {
    return new Promise((resolve, reject) => {
      imagesLoaded(
        document.querySelectorAll(".content__img--full"),
        { background: true },
        resolve
      );
    });
  };

  // And then..
  preloadImages().then(() => {
    // Remove the loader
    document.body.classList.remove("loading");
    new ImageTrail();
  });
}
