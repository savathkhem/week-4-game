//Global variables
$(function() {
    console.log( "Game Ready!" );



//Array of Playable Characters
let characters = {
    'Ryu': {
        name: 'Ryu',
        health: 120,
        attack: 8,
        imageUrl: "assets/images/RyuL.png",
        imageUrl2: "assets/images/RyuR.png",
        enemyAttackBack: 15
    }, 
    'ChungLi': {
        name: 'ChungLi',
        health: 100,
        attack: 14,
        imageUrl: "assets/images/ChungliL.png",
        imageUrl2: "assets/images/ChungliR.png",
        enemyAttackBack: 5
    }, 
    'Sagat': {
        name: 'Sagat',
        health: 150,
        attack: 8,
        imageUrl: "assets/images/SagatL.png",
        imageUrl2: "assets/images/SagatR.png",
        enemyAttackBack: 20
    }, 
    'Bison': {
        name: 'Bison',
        health: 180,
        attack: 7,
        imageUrl: "assets/images/BisonL.png",
        imageUrl2: "assets/images/BisonR.png",
        enemyAttackBack: 20
    }
};


var currSelectedCharacter;
var currNpc;
var combatants = [];
var indexofSelChar;
var attackResult;
var turnCounter = 1;
var killCount = 0;


//FUNCTION TO RENDER SELECTABLE-CHARACTERS
var renderOne = function(character, renderArea, makeChar) {
    //character: obj, renderArea: class/id, makeChar: string
    var charDiv = $("<div class='col-sm-3 character' data-name='" + character.name + "'>");
    var charName = $("<div class='character-name'>").text(character.name);
    var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
    var charHealth = $("<div class='character-health'>").text(character.health);
    charDiv.append(charName).append(charImage).append(charHealth);
    $(renderArea).append(charDiv);

    // CONDITIONAL RENDER
    if (makeChar == 'enemy') {
        $(charDiv).addClass('enemy');
      } else if (makeChar == 'npc') {
        currNpc = character;
        $(charDiv).addClass('target-enemy');
      }
  };

  // CREATE FUNCTION TO RENDER GAME MESSAGE TO DOM
  var renderMessage = function(message) {
    var gameMessageSet = $("#gameMessage");
    var newMessage = $("<div>").text(message);
    gameMessageSet.append(newMessage);

    if (message == 'clearMessage') {
      gameMessageSet.text('');
    }
  };


  var renderCharacters = function(charObj, areaRender) {
    //RENDERS ALL CHARACTER TO ROSTER
    if (areaRender == '#roster-section') {
      $(areaRender).empty();
      for (var key in charObj) {
        if (charObj.hasOwnProperty(key)) {
          renderOne(charObj[key], areaRender, '');
        }
      }
    }
    //RENDER PLAYER
    if (areaRender == '#player-combat-section') {
      $('#player-combat-section').prepend("<p><h2>Your Character</h2></p>");       
      renderOne(charObj, areaRender, '');
      $('#attack-button').css('visibility', 'visible');
    }
    //CREATE OPPONENT ROSTER
    if (areaRender == '#npc-roster-section') {
        $('#npc-roster-section').prepend("<p><h2>Choose Your Next Opponent<h2></p>");      
      for (var i = 0; i < charObj.length; i++) {

        renderOne(charObj[i], areaRender, 'enemy');
      }
      //RENDER NPC OPPONENT
      $(document).on('click', '.enemy', function() {
        //SELECT NPC OPPONENT
        name = ($(this).data('name'));
        //IF NPC IS EMPTY
        if ($('#npc').children().length === 0) {
          renderCharacters(name, '#npc');
          $(this).hide();
          renderMessage("clearMessage");
        }
      });
    }
    //RENDER NPC OPPONENT
    if (areaRender == '#npc') {
      $(areaRender).empty();
      for (var i = 0; i < combatants.length; i++) {
        //ADD ENEMY TO npc-roster-section
        if (combatants[i].name == charObj) {
          $('#npc').append("<p><h2>Your selected opponent</h2></p>")
          renderOne(combatants[i], areaRender, 'npc');
        }
      }
    }
    //RE-RENDER NPC OPPONENT WHEN ATTACKED
    if (areaRender == 'playerDamage') {
      $('#npc').empty();
      $('#npc').append("<p><h2>Your selected opponent</h2></p>")
      renderOne(charObj, '#npc', 'npc');
    }
    //RE-RENDER PLAYER WHEN ATTACKED
    if (areaRender == 'enemyDamage') {
      $('#player-combat-section').empty();
      $('#player-combat-section').append("<p><h2>Your Character</h2></p>")
      renderOne(charObj, '#player-combat-section', '');
    }
    //RENDER DEFEATED ENEMY
    if (areaRender == 'enemyDefeated') {
      $('#npc').empty();
      var gameStateMessage = "You have defeated " + charObj.name + ", you can choose to fight another enemy.";
      renderMessage(gameStateMessage);
    }
  };


    //RENDER COMPLETE ROSTER OF SELECTABLE CHARACTERS
    renderCharacters(characters, '#roster-section');
    $(document).on('click', '.character', function() {
      name = $(this).data('name');
      //if no player char has been selected
      if (!currSelectedCharacter) {
        currSelectedCharacter = characters[name];
        for (var key in characters) {
          if (key != name) {
            combatants.push(characters[key]);
          }
        }
        $("#roster-section").hide();
        renderCharacters(currSelectedCharacter, '#player-combat-section');
        //RENDER SELECTABLE NPC TO FIGHT
        renderCharacters(combatants, '#npc-roster-section');
      }
    });





//   // ----------------------------------------------------------------
//   // Create functions to enable actions between objects.
$("#attack-button").on("click", function() {
    //if npc area has enemy
    if ($('#npc').children().length !== 0) {
      //npc state change
      var attackMessage = "You attacked " + currNpc.name + " for " + (currSelectedCharacter.attack * turnCounter) + " damage.";
      renderMessage("clearMessage");
      //combat
      currNpc.health = currNpc.health - (currSelectedCharacter.attack * turnCounter);

      //win condition
      if (currNpc.health > 0) {
        //enemy not dead keep playing
        renderCharacters(currNpc, 'playerDamage');
        //player state change
        var counterAttackMessage = currNpc.name + " attacked you back for " + currNpc.enemyAttackBack + " damage.";
        renderMessage(attackMessage);
        renderMessage(counterAttackMessage);

        currSelectedCharacter.health = currSelectedCharacter.health - currNpc.enemyAttackBack;
        renderCharacters(currSelectedCharacter, 'enemyDamage');
        if (currSelectedCharacter.health <= 0) {
          renderMessage("clearMessage");
          restartGame("You have been defeated...GAME OVER!!!");
          $("#attack-button").unbind("click");
        }
      } else {
        renderCharacters(currNpc, 'enemyDefeated');
        killCount++;
        if (killCount >= 3) {
          renderMessage("clearMessage");
          restartGame("You Won!!!! GAME OVER!!!");
        }
      }
      turnCounter++;
    } else {
      renderMessage("clearMessage");
      renderMessage("No enemy here.");
    }
  });

//RENDER RESET BUTTON
var restartGame = function(inputEndGame) {
    //RELOAD PAGE ON CLICK RESTART
    var restart = $('<button class="btn btn-dark">Restart</button>').click(function() {
      location.reload();
    });
    var gameState = $("<div>").text(inputEndGame);
    $("#gameMessage").append(gameState);
    $("#gameMessage").append(restart);
  };




});

