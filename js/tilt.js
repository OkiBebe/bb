/* tilt.js — 3D squircle: follows the mouse cursor on desktop,
 * follows the gyroscope on mobile. Idle gentle sway when no input.
 */
(function () {
  'use strict';

  var scene = document.querySelector('.scene');
  var card = document.querySelector('.squircle');
  if (!scene || !card) return;

  var sheen = card.querySelector('.sheen');
  var floorShadow = scene.querySelector('.floor-shadow');

  var MAX_TILT = 14;          // degrees
  var MAX_IDLE = 6;           // idle sway amplitude
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  var curRX = 0, curRY = 0;    // current (smoothed)
  var targetRX = 0, targetRY = 0;
  var activeUntil = 0;         // timestamp; after this, ease back to idle
  var hadInput = false;
  var gyroOn = false;
  var start = performance.now();

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function setTarget(rx, ry, holdMs) {
    targetRX = clamp(rx, -MAX_TILT, MAX_TILT);
    targetRY = clamp(ry, -MAX_TILT, MAX_TILT);
    activeUntil = holdMs === Infinity ? Infinity : performance.now() + (holdMs || 0);
    hadInput = true;
  }

  // --- mouse (desktop) -------------------------------------------------
  if (!coarse) {
    scene.addEventListener('mousemove', function (e) {
      var r = scene.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
      var py = (e.clientY - r.top) / r.height - 0.5;
      // Hold the pose while the cursor rests anywhere over the scene.
      setTarget(-py * MAX_TILT * 2, px * MAX_TILT * 2, Infinity);
    });
    scene.addEventListener('mouseleave', function () {
      setTarget(0, 0, 0);
    });
  }

  // --- gyroscope (mobile) ----------------------------------------------
  function onOrientation(e) {
    if (e.beta == null || e.gamma == null) return;
    gyroOn = true;
    // beta: -180..180 (device front-back), gamma: -90..90 (left-right)
    // Treat ~45deg as neutral "held naturally" position.
    var rx = clamp(((e.beta - 45) / 35) * -MAX_TILT, -MAX_TILT, MAX_TILT);
    var ry = clamp((e.gamma / 50) * MAX_TILT, -MAX_TILT, MAX_TILT);
    setTarget(rx, ry, 900); // keep gyro pose for a moment after events stop
  }

  function enableGyro() {
    window.addEventListener('deviceorientation', onOrientation, true);
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function' &&
      !gyroOn
    ) {
      DeviceOrientationEvent.requestPermission()
        .then(function (state) {
          if (state !== 'granted') gyroOn = false;
        })
        .catch(function () {});
    }
  }

  if (coarse && typeof DeviceOrientationEvent !== 'undefined') {
    // iOS requires a user gesture before requesting gyro permission.
    var once = function () {
      enableGyro();
      document.removeEventListener('pointerdown', once);
    };
    document.addEventListener('pointerdown', once, { passive: true });
    // Android + desktop-mobile hybrids deliver events without permission.
    window.addEventListener('deviceorientation', onOrientation, true);
  }

  // --- render loop -------------------------------------------------------
  function tick() {
    var now = performance.now();
    var t = (now - start) / 1000;

    var idleRX, idleRY;
    if (reduced || hadInput) {
      idleRX = 0;
      idleRY = 0;
    } else {
      idleRX = Math.sin(t * 0.55) * MAX_IDLE;
      idleRY = Math.cos(t * 0.4) * MAX_IDLE;
    }

    // Ease back to idle when input has lapsed.
    var baseRX = now > activeUntil ? idleRX : targetRX;
    var baseRY = now > activeUntil ? idleRY : targetRY;

    curRX += (baseRX - curRX) * 0.12;
    curRY += (baseRY - curRY) * 0.12;

    card.style.transform =
      'rotateX(' + curRX.toFixed(3) + 'deg) rotateY(' + curRY.toFixed(3) + 'deg)';

    if (sheen) {
      sheen.style.opacity = (0.4 + (Math.abs(curRX) + Math.abs(curRY)) / 60).toFixed(3);
    }
    if (floorShadow) {
      floorShadow.style.transform =
        'translateX(' + (curRY * -1.4).toFixed(1) + 'px) scale(' +
        (1 - (Math.abs(curRX) + Math.abs(curRY)) / 160).toFixed(3) + ')';
      floorShadow.style.opacity = (0.85 - (Math.abs(curRX) + Math.abs(curRY)) / 90).toFixed(3);
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
