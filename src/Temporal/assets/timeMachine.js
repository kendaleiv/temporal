﻿(function () {
  'use strict';

  var widget = document.getElementById('temporal-time-machine-widget-js');
  var header = document.getElementById('temporal-time-machine-header-js');
  var isFrozenHeader = document.getElementById('temporal-time-machine-header-is-frozen-js');
  var collapseContainer = document.getElementById('temporal-time-machine-collapse-container-js');
  var localPicker = document.getElementById('temporal-time-machine-local-datetime-js');
  var utcPicker = document.getElementById('temporal-time-machine-utc-datetime-js');
  var actionButton = document.getElementById('temporal-time-machine-action-button-js');
  var refreshInterval;

  collapseContainer.style.display = 'none';

  var getDateTimeLocalFormat = function(date) {
    return date.toISOString().replace(/Z$/, '').replace(/\.\d{3}$/, '');
  };

  var isFrozen = isFrozenHeader.innerText === 'Frozen';

  if (!isFrozen) {
    refreshInterval = setInterval(function() {
      localPicker.value = getDateTimeLocalFormat(new Date(Date.now() - new Date().getTimezoneOffset() * 60 * 1000));
      utcPicker.value = getDateTimeLocalFormat(new Date(Date.now()));
    }, 1000);
  }

  localPicker.addEventListener('change', function(evt) {
    clearInterval(refreshInterval);

    var utcValue = new Date(Date.parse(evt.target.value) + new Date().getTimezoneOffset() * 60 * 1000);
    utcPicker.value = getDateTimeLocalFormat(utcValue);
  });

  utcPicker.addEventListener('change', function(evt) {
    clearInterval(refreshInterval);

    var localValue = new Date(Date.parse(evt.target.value) - new Date().getTimezoneOffset() * 60 * 1000);
    localPicker.value = getDateTimeLocalFormat(localValue);
  });

  actionButton.addEventListener('click', function(evt) {
    evt.target.disabled = true;
    evt.target.innerHTML = 'Waiting ...';

    var url = isFrozen
      ? widget.dataset.temporalTimeMachineUnfreezeEndpoint
      : widget.dataset.temporalTimeMachineFreezeEndpoint + '?utc=' + utcPicker.value;

    fetch(url, {
      credentials: 'same-origin'
    }).then(function () {
      isFrozen = !isFrozen;

      evt.target.disabled = false;
      evt.target.innerHTML = isFrozen ? 'Go Live' : 'Freeze';

      isFrozenHeader.innerHTML = isFrozen ? 'Frozen' : 'Live';
    });
  });

  header.addEventListener('click', function() {
    var currentDisplay = collapseContainer.style.display;

    if (currentDisplay === 'none') {
      collapseContainer.style.display = 'inherit';
    }
    else {
      collapseContainer.style.display = 'none';
    }
  }, false);
})();
