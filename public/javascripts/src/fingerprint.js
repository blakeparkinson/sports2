(function(window, document, JSON){
  "use strict";
  var SEP = '|', ua, opera, ie;
  /*
   * Collect Browser & Device Data
   */
  var cc = {

    //generating ids
    hashString : function (s) {
      return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    },


    ua : function () {
      return window.navigator.userAgent || "unknown ua";
    },

    display : function () {
      var screen = window.screen || screen || {};
      return JSON.stringify(screen);
    },

    software : function() {
      var i, t = "",
          isFirst = true,
          temp = "",
          lastDir = "Plugins",
          plugin, mimeType, components, ver;

      if (window.navigator.plugins.length > 0) {
        if (opera) {
          temp = "";
          lastDir = "Plugins";

          for (i = 0; i < window.navigator.plugins.length; i++) {
            plugin = window.navigator.plugins[i];
            if (isFirst === true) {
              temp += this.stripFullPath(plugin.filename, lastDir);
              isFirst = false;
            } else {
              temp += SEP + this.stripFullPath(plugin.filename, lastDir);
            }
          }
          t = this.stripIllegalChars(temp);
        } else {
          for (i = 0; i < window.navigator.plugins.length; i++) {
            plugin = window.navigator.plugins[i];
            if (isFirst === true) {
              t += plugin.filename;
              isFirst = false;
            } else {
              t += SEP + plugin.filename;
            }
          }
        }
      } else if (window.navigator.mimeTypes.length > 0) {
        for (i = 0; i < window.navigator.mimeTypes.length; i++) {
          mimeType = window.navigator.mimeTypes[i];
          if (isFirst === true) {
            t += mimeType.type;
            isFirst = false;
          } else {
            t += SEP + mimeType.type;
          }
        }
      } else if (ie) {
        components = new Array("7790769C-0471-11D2-AF11-00C04FA35D02", "89820200-ECBD-11CF-8B85-00AA005B4340", "283807B5-2C60-11D0-A31D-00AA00B92C03", "4F216970-C90C-11D1-B5C7-0000F8051515", "44BBA848-CC51-11CF-AAFA-00AA00B6015C", "9381D8F2-0288-11D0-9501-00AA00B911A5", "4F216970-C90C-11D1-B5C7-0000F8051515", "5A8D6EE0-3E18-11D0-821E-444553540000", "89820200-ECBD-11CF-8B85-00AA005B4383", "08B0E5C0-4FCB-11CF-AAA5-00401C608555", "45EA75A0-A269-11D1-B5BF-0000F8051515", "DE5AED00-A4BF-11D1-9948-00C04F98BBC9", "22D6F312-B0F6-11D0-94AB-0080C74C7E95", "44BBA842-CC51-11CF-AAFA-00AA00B6015B", "3AF36230-A269-11D1-B5BF-0000F8051515", "44BBA840-CC51-11CF-AAFA-00AA00B6015C", "CC2A9BA0-3BDD-11D0-821E-444553540000", "08B0E5C0-4FCB-11CF-AAA5-00401C608500", "D27CDB6E-AE6D-11CF-96B8-444553540000", "2A202491-F00D-11CF-87CC-0020AFEECF20");
        document.body.addBehavior("#default#clientCaps");
        for (i = 0; i < components.length; i++) {
          ver = this.activeXDetect(components[i]);
          if (ver) {
            if (isFirst === true) {
              t += ver;
              isFirst = false;
            } else {
              t += SEP + ver;
            }
          } else {
            t += SEP + "null";
          }
        }
      }

      return t;
    },

    activeXDetect : function(componentClassID) {
      var componentVersion = document.body.getComponentVersion('{' + componentClassID + '}', 'ComponentID');
      return (componentVersion !== null) ? componentVersion : false;
    },

    stripIllegalChars : function(value) {
      var t = "",
          i;

      value = value.toLowerCase();
      for (i = 0; i < value.length; i++) {
        if (value.charAt(i) !== '\n' && value.charAt(i) !== '/' && value.charAt(i) !== "\\") {
          t += value.charAt(i);
        } else if (value.charAt(i) === '\n') {
          t += "n";
        }
      }
      return t;
    },

    stripFullPath : function(tempFileName, lastDir) {
      var fileName = tempFileName,
          filenameStart = fileName.lastIndexOf(lastDir),
          filenameFinish = fileName.length;

      if (filenameStart < 0) {
        filenameStart = 0;
      }

      fileName = fileName.substring(filenameStart + lastDir.length, filenameFinish);

      return fileName;
    },

    myDeviceHash : function () {
      return this.hashString(this.ua() + this.display() + this.software());
    }

  };

  // storing information in global object
  window.fingerprint = {
    md5hash : cc.myDeviceHash(),
    collection : {
      ua : cc.ua(),
      display   : cc.display(),
      software  : cc.software()
    }
  };

  $.ajax({
    url: 'fingerprint/id',
    data: {'id': window.fingerprint.md5hash},
    type: 'get',
    dataType: 'json',
    success: function(response){
      var div1 = $('.fp-message'),
        div2 = $('.fp-id');
      div1.append(response.message);
      div2.append('Your ID is '+response.id);
    }
  });

}(window, document, JSON ));
