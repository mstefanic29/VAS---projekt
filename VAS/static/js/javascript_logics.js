var word = "";
var replacedWord = "";
var currentAgent = "a";
var pointsA = 0;
var pointsB = 0;
var winPoints = 0;

function getWord() {
  $("#host-dialog").text("Dobrodošli u Kolo sreće!");
  setTimeout(function () {
    $("#host-dialog").text(
      "Za nekoliko trenutaka započet ćemo s igrom. Prvi na redu je agent A"
    );
    setTimeout(function () {
      $("#pointsA").text(pointsA);
      $("#pointsB").text(pointsB);
      $.ajax({
        url: "/getRandomWord",
        type: "GET",
        success: function (response) {
          word = JSON.parse(response);
          replacedWord = word.replace(/[a-zžčćšđ]/gi, " _");
          replacedWord = replacedWord.replace("  ", "   ");
          $("#demo").html(replacedWord.replace("   ", "&nbsp;&nbsp;&nbsp;"));
          setTimeout(function () {
            spinWheel();
          }, 2000);
        },
        error: function (error) {
          console.log(error);
        },
      });
    }, 2000);
  }, 2000);
}

function giveWord(agent) {
  $.ajax({
    url: "/giveWord",
    type: "POST",
    data: { agent: JSON.stringify(agent) },
    success: function (response) {
    message = ""
      if (currentAgent == "a") {
        if (response.length > 1) message = "Konačno rješenje: "
        else message = "Dajem slovo "
        $(".dialog-2").css("display", "block");
        $(".right-point-2").css("display", "block");
        $("#agent-a-dialog").text(message + response.toUpperCase());
      } else {
        $(".dialog-3").css("display", "block");
        $(".right-point-3").css("display", "block");
        $("#agent-b-dialog").text(message + response.toUpperCase());
      }
      setTimeout(function(){ checkWord(response) }, 5000);
    },
    error: function (error) {
      console.log(error);
    },
  });
}

function checkWord(response) {
  $.ajax({
    url: "/checkWord",
    type: "POST",
    data: { letter: JSON.stringify(response) },
    success: function (response) {
      if (currentAgent == "a") {
        $(".dialog-2").css("display", "none");
        $(".right-point-2").css("display", "none");
      } else {
        $(".dialog-3").css("display", "none");
        $(".right-point-3").css("display", "none");
      }

      debugger;
      if (response.length > 3) {
        points = null
        if (currentAgent == "a") points = pointsA
        else points = pointsB
        $("#demo").html(response.replace("   ", "&nbsp;&nbsp;&nbsp;"));
        $("#host-dialog").text(
          "Agent " +
            currentAgent.toUpperCase() +
            " je pogodio frazu! Čestitamo, osvojili ste:  " + points
        );
        setTimeout(function() {
          if(!alert("Igra je završila i pobjednik je " + currentAgent.toUpperCase() + ". Kreće nova igra.")){
            window.location.reload()
          }
        }, 1000)
      }
      if (response == "-1") {
        setTimeout(function () {
          $("#host-dialog").text(
            "Nažalost, krivo slovo. Agent " +
              currentAgent.toUpperCase() +
              " ne osvaja okrenuti iznos. Vrti drugi agent"
          );
          if (currentAgent == "a") {
            if (pointsA > 0) $("#pointsA").text(parseInt(pointsA) - winPoints);
            currentAgent = "b";
            console.log("Sad treba vrtiejti" + currentAgent)
          } else {
            if (pointsB > 0) $("#pointsB").text(parseInt(pointsB) - winPoints);
            currentAgent = "a";
            console.log("Sad treba vrtjeti " + currentAgent)
          }

          spinWheel();
          return;
        }, 2000);
      } else {
        setTimeout(function () {
          $("#host-dialog").text(
            "Agent " +
              currentAgent.toUpperCase() +
              " je odabrao slovo " +
              response +
              " i pogodio je."
          );
          for (var i = 0; i < word.length; i++) {
            if (
              word[i].toLowerCase() == response.toLowerCase() &&
              word[i] != " "
            ) {
              replacedWord =
                replacedWord.substring(0, i * 2 + 1) + 
                word[i] +
                replacedWord.substring(i * 2 + 2);
            }
          }
          //word = word.replace(/_/gi, " _");
          $("#demo").html(replacedWord.replace("   ", "&nbsp;&nbsp;&nbsp;"));
          spinWheel();
        }, 2000);
      }
    },
    error: function (error) {
      console.log(error);
    },
  });
}

function spinWheel() {
  {
    theWheel.animation.spins = Math.random() * (10 - 1) + 1;
    theWheel.startAnimation();
  }
}

function alertPrize(indicatedSegment) {
  // Just alert to the user what happened.
  // In a real project probably want to do something more interesting than this with the result.
  if (indicatedSegment.text == "LOOSE TURN") {
    if (currentAgent == "a") currentAgent = "b";
    else currentAgent = "a";
    console.log(currentAgent);
    setTimeout(function () {
      $("#host-dialog").text(
        "Preskok. Agent " + currentAgent.toUpperCase() + " vrti sljedeći."
      );
      spinWheel();
    }, 2000);
  } else if (indicatedSegment.text == "BANKRUPT") {
    if (currentAgent == "a") {
      pointsA = 0;
      $("#pointsA").text(pointsA);
      currentAgent = "b";
    } else {
      pointsB = 0;
      $("#pointsB").text(pointsB);
      currentAgent = "a";
    }
    console.log(currentAgent);
    setTimeout(function () {
      $("#host-dialog").text(
        "Bankrot. Agent " + currentAgent.toUpperCase() +
              " gubi sve novce. Agent " +
              currentAgent.toUpperCase() +
              " vrti sljedeći."
      );
      spinWheel();
    }, 2000);
  } else {
    winPoints = indicatedSegment.text;
    console.log(currentAgent);
    if (currentAgent == "a") {
      pointsA = parseInt(pointsA) + parseInt(indicatedSegment.text);
      $("#pointsA").text(pointsA);
    } else {
      pointsB = parseInt(pointsB) + parseInt(indicatedSegment.text);
      $("#pointsB").text(pointsB);
    }
    setTimeout(function () {
      $("#host-dialog").text(
        "Agent " +
          currentAgent.toUpperCase() +
          " je osvojio " +
          indicatedSegment.text +
          " ako ponudi dobro slovo."
      );
      giveWord(currentAgent);
    }, 2000);
  }
}
