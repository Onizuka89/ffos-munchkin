function log(message)
{
	console.log(message);
}

function Install() {
   this.state = "idle";

   // trigger events registration
   var events = new Object();
   this.on = function(name, func) {
      events[name] = (events[name] || []).concat([func]);
   };
   this.off = function(name, func) {
      if (events[name]) {
         var res = [];
         for (var i=0, l=events[name].length; i<l; ++i) {
            var f = events[name][i];
            if (f != func) res.push();
         }
         events[name] = res;
      }
   };
   this.trigger = function(name) {
      var args = Array.prototype.slice.call(arguments, 1);
      if (events[name]) {
         for (var i=0, l=events[name].length; i<l; ++i) {
            events[name][i].apply(this, args);
         }
      }
   };
   this.triggerChange = function(state) {  // helper
      //var msg = "State: " + this.state + " -> " + state;
      //if (typeof this.error !== "undefined") msg += "\n" + this.error;
      //alert(msg);
      this.state = state;
      this.trigger("change", this.state);
   }

   if (navigator.mozApps) {
      var request = navigator.mozApps.getSelf();
      var that = this;
      request.onsuccess = function () {
         if (!this.result) {
            that.triggerChange("uninstalled");
            that.installUrl = (
               location.href.substring(0, location.href.lastIndexOf("/")) +
               "/webapp.manifest"
            );
            that.doIt = function() {
               //*/ alert("Faking install from " + that.installUrl);
               try {
                  var req2 = navigator.mozApps.install(that.installUrl);
                  req2.onsuccess = function(data) {
                     that.triggerChange("installed");
                     //*/ alert("Bingo!");
                  };
                  req2.onerror = function() {
                     that.error = this.error;
                     that.triggerChange("failed");
                  };
               }catch (error) {
                  that.error = error;
                  that.triggerChange("failed");
               }
            };
         }else {
            that.triggerChange("installed");
         }
      };
      request.onerror = function (error) {
         that.error = error;
         that.triggerChange("failed");
		 console.log(error);
      };
   }else if ((typeof chrome !== "undefined") && chrome.webstore && chrome.app) {
      if (!chrome.app.isInstalled) {
         this.triggerChange("uninstalled");
         var that = this;
         this.doIt = function() {
            chrome.webstore.install(
               null,
               function () { that.triggerChange("installed"); },
               function (err) {
                  that.error = err;
                  that.triggerChange("failed");
               }
            );
         };
      }else {
         this.triggerChange("installed");
      }
   }else if (typeof window.navigator.standalone !== "undefined") {
      if (!window.navigator.standalone) {
         this.triggerChange("uninstalled");
         /*
         | Right now, just asks that something show a UI element mentioning
         | how to install using Safari's "Add to Home Screen" button.
         */
         this.doIt = function() {
            this.trigger("showiOSInstall", navigator.platform.toLowerCase());
         };
      }else {
         this.triggerChange("installed");
      }
   }else {
      this.triggerChange("unsupported");
   }
   return this;
}

function setInstallButton(buttonId) {
   if (!document.getElementById(buttonId)) {
      document.addEventListener("DOMContentLoaded", setInstallButton);
   }else {
      var install = new Install();
      var buttonElt = document.getElementById(buttonId);
      install.on(
         "change",
         function() {
            buttonElt.style.display = (
               (install.state == "uninstalled")? "table-cell" : "none"
            );
            if (install.state == "failed") {
               alert("Install failed:\n" + install.error);
            }
         }
      );
      install.on(
         "showiOSInstall",
         function() {
            alert(
               "To install, press the forward arrow in Safari " +
               "and touch \"Add to Home Screen\""
            );
         }
      );
      buttonElt.addEventListener(
         "click", function() { install.doIt(); }
      );
   }
}

function pickProfilePicture()
{
	var pickProfileImage = new MozActivity({name: "pick", data: { type: ["image/png", "image/jpg", "image/jpeg"] }});
	pickProfileImage.onsuccess = function () 
	{
		var profileImage = document.querySelector("#profilePicture");
		profileImage.src = window.URL.createObjectURL(this.result.blob);
		localStorage.setItem("munchkin_profile_picture", profileImage.src);
	};
	pickProfileImage.onerror = function () {
		alert("Could not update profile image");
	};
}


function changeCounter()
{
	
	if(this.id === "levelUp")
	{
		levelUp();
	}else if(this.id === "levelDown")
	{
		levelDown();
	}else if(this.id === "gearUp")
	{
		gearUp();
	}else if(this.id === "gearDown")
	{
		gearDown();
	}else if(this.id === "monsterLevelUp")
	{
		monsterUp();
	}else if(this.id === "monsterLevelDown")
	{
		monsterDown();
	}else if(this.id === "battleModifierUp")
	{
		battleModifierUp();
	}else if(this.id === "battleModifierDown")
	{
		battleModifierDown();
	}

	updatePower();
	
}

function updatePower()
{
	var battleScreen = document.querySelector("#battle");
	var characterScreen = document.querySelector("#character");
	if(characterScreen.style.display === "block") // if character is displayed, and battle is not
	{
		var powerDisplay = document.querySelector("#powerDisplay");
		var levelDisplay = document.querySelector("#levelDisplay");
		var gearDisplay = document.querySelector("#gearDisplay");
		powerDisplay.innerHTML = parseInt(levelDisplay.innerHTML) + parseInt(gearDisplay.innerHTML);
		
		localStorage.setItem("munchkin_level", levelDisplay.innerHTML);
		localStorage.setItem("munchkin_gear", gearDisplay.innerHTML);
	}else if(battleScreen.style.display === "block")
	{
		var battlePowerDifferenceDisplay = document.querySelector("#battlePowerDifferenceDisplay");
		var battleResultDisplay = document.querySelector("#battleResultDisplay");
		var modifierDisplay = document.querySelector("#battleModifierDisplay");
		var monsterLevelDisplay = document.querySelector("#monsterLevelDisplay");
		
		var monsterLevel = parseInt(monsterLevelDisplay.innerHTML);
		var battleModifier = parseInt(modifierDisplay.innerHTML);
		
		var characterLevel = localStorage.getItem("munchkin_level");
		var characterGear = localStorage.getItem("munchkin_gear");
		var characterPower = parseInt(characterLevel) + parseInt(characterGear);
		
		var monsterPower = battleModifier + monsterLevel;
		var battleResult = characterPower - monsterPower;
		
		if(battleResult < 1) 
		{
			battlePowerDifferenceDisplay.innerHTML = battleResult;
			battleResultDisplay.innerHTML = "You lose";
		}else
		{
			battlePowerDifferenceDisplay.innerHTML = "+" + battleResult;
			battleResultDisplay.innerHTML = "You win";
		}
		
		localStorage.setItem("monster_level", monsterLevel);
		localStorage.setItem("battle_modifier", battleModifier);
	}
}

function levelUp()
{
	var levelDisplay = document.querySelector("#levelDisplay");
	var levels = parseInt(levelDisplay.innerHTML);
	levels++;
	levelDisplay.innerHTML = levels;
}

function levelDown()
{
	var levelDisplay = document.querySelector("#levelDisplay");
	var levels = parseInt(levelDisplay.innerHTML);
	if(levels>1)
	{
		levels--;
	}
	levelDisplay.innerHTML = levels;
}

function gearUp()
{
	var gearDisplay = document.querySelector("#gearDisplay");
	var gear = parseInt(gearDisplay.innerHTML);
	gear++;
	gearDisplay.innerHTML = gear;
}

function gearDown()
{
	var gearDisplay = document.querySelector("#gearDisplay");
	var gear = parseInt(gearDisplay.innerHTML);
	if(gear>0)
	{
		gear--;
	}
	gearDisplay.innerHTML = gear;
}

function monsterDown()
{
	var monsterLevelDisplay = document.querySelector("#monsterLevelDisplay");
	var monsterLevel = parseInt(monsterLevelDisplay.innerHTML);
	if(monsterLevel > 1)
	{
		monsterLevel--;
	}
	monsterLevelDisplay.innerHTML = monsterLevel;
}

function monsterUp()
{
	var monsterLevelDisplay = document.querySelector("#monsterLevelDisplay");
	var monsterLevel = parseInt(monsterLevelDisplay.innerHTML);
	monsterLevel++;
	monsterLevelDisplay.innerHTML = monsterLevel;
}

function battleModifierUp()
{
	var modifierDisplay = document.querySelector("#battleModifierDisplay");
	modifier = parseInt(modifierDisplay.innerHTML);	
	modifier++;
	modifierDisplay.innerHTML = modifier;
}

function battleModifierDown()
{
	var modifierDisplay = document.querySelector("#battleModifierDisplay");
	modifier = parseInt(modifierDisplay.innerHTML);	
	modifier--;
	modifierDisplay.innerHTML = modifier;
}

function showCharacterScreen()
{
	var battleScreen = document.querySelector("#battle");
	if(battleScreen.style.display !== "none")
	{
		battleScreen.style.display = "none";
	}
	var characterScreen = document.querySelector("#character");
	if(characterScreen.style.display !== "block")
	{
		characterScreen.style.display = "block";
	}
	updatePower();
}

function showBattleScreen()
{
	var characterScreen = document.querySelector("#character");
	if(characterScreen.style.display !== "none")
	{
		characterScreen.style.display = "none";
	}
	var battleScreen = document.querySelector("#battle");
	if(battleScreen.style.display !== "block")
	{
		battleScreen.style.display = "block";
	}
	updatePower();
}

function setupListeners()
{
	var profilePicture = document.querySelector("#profilePicture");
	profilePicture.addEventListener("touchstart", pickProfilePicture);
	profilePicture.addEventListener("click", pickProfilePicture);
	
	var characterButton = document.querySelector("#characterButton");
	characterButton.addEventListener("touchstart", showCharacterScreen);
	characterButton.addEventListener("click", showCharacterScreen);
	
	var battleButton = document.querySelector("#battleButton");
	battleButton.addEventListener("touchstart", showBattleScreen);
	battleButton.addEventListener("click", showBattleScreen);
	
	var pickers = document.querySelectorAll(".picker");
	for (var i=0, l=pickers.length; i<l; i++) {
		pickers[i].addEventListener("touchstart", changeCounter);
		pickers[i].addEventListener("click", changeCounter);
	};	
	
	var characterName = document.querySelector("#textContents");
	characterName.addEventListener("onkeydown", storeUpdatedName);
}

function storeUpdatedName()
{
	var characterName = document.querySelector("#textContents");
	localStorage.setItem("munchkin_cname", characterName.value);
}

function restoreFromLocalStorage()
{
	var levels = localStorage.getItem("munchkin_level");
	if(levels > 1)
	{
		var levelDisplay = document.querySelector("#levelDisplay");
		levelDisplay.innerHTML = levels;
	}
	
	var gear = localStorage.getItem("munchkin_gear");
	if(gear > 0)
	{
		var gearDisplay = document.querySelector("#gearDisplay");
		gearDisplay.innerHTML = gear;
	}
	
	var profilePicture = localStorage.getItem("munchkin_profile_picture");
	if(profilePicture != null)
	{
		var profileImage = document.querySelector("#profilePicture");
		profileImage.src = profilePicture;
	}
	
	var characterNameValue = localStorage.getItem("munchkin_cname");
	if(characterNameValue != null)
	{
		var characterName = document.querySelector("#textContents");
		characterName.value = characterNameValue;
	}
	
	var monsterLevel = localStorage.getItem("monster_level");
	if(monsterLevel != null)
	{
		var monsterLevelDisplay = document.querySelector("#monsterLevelDisplay");
		monsterLevelDisplay.innerHTML = monsterLevel;
	}
	
	var battleModifier = localStorage.getItem("battle_modifier");
	if(battleModifier != null)
	{
		var modifierDisplay = document.querySelector("#battleModifierDisplay");
		modifierDisplay.innerHTML = battleModifier;
	}


	updatePower();
}



document.addEventListener("DOMContentLoaded", function () {
	setInstallButton("btnInstall");
	setupListeners();
	restoreFromLocalStorage();
});



