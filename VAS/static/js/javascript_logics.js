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
      if (JSON.parse(response).length > 1) message = "Konačno rješenje: "
      else message = "Dajem slovo "
      if (currentAgent == "a") {
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
      if (JSON.parse(response).length > 1) {
        points = null
        if (currentAgent == "a") points = pointsA
        else points = pointsB
        $("#demo").html(JSON.parse(response).replace("   ", "&nbsp;&nbsp;&nbsp;"));
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
            if (pointsA > 0) {
              pointsA = parseInt(pointsA) - winPoints
              $("#pointsA").text(pointsA);
            }
            currentAgent = "b";
          } else {
            if (pointsB > 0) {
              pointsB = parseInt(pointsB) - winPoints
              $("#pointsB").text(pointsB);
            }
            currentAgent = "a";
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
          var wordCount = 1;
          for (var i = 0; i < word.length; i++) {
            if (
              word[i].toLowerCase() == JSON.parse(response).toLowerCase() &&
              word[i] != " "
            ) {
              replacedWord =
                replacedWord.substring(0, i * 2 + 1) + 
                word[i] +
                replacedWord.substring(i * 2 + 2);
                if (currentAgent == "a") {
                  pointsA = pointsA * wordCount;
                  $("#pointsA").text(pointsA);
                  wordCount = wordCount + 1;
                }
                if (currentAgent == "b") {
                  pointsB = pointsB * wordCount;
                  $("#pointsB").text(pointsB);
                  wordCount = wordCount + 1;
                }
            }
          }
          $("#demo").html(replacedWord.replace("   ", "&nbsp;&nbsp;&nbsp;"));
          if(word == replacedWord.replace(/\s/g, "")) {
            $("#host-dialog").text(
              "Agent " +
                currentAgent.toUpperCase() +
                " je dobio točno rješenje. Čestitke"
            );
            setTimeout(function(){ if(!alert("Igra je završila i pobjednik je " + currentAgent.toUpperCase() + ". Kreće nova igra.")){
              window.location.reload()
            }}, 200)
          }
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
  if (indicatedSegment.text == "LOOSE TURN") {
    if (currentAgent == "a") currentAgent = "b";
    else currentAgent = "a";
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
    setTimeout(function () {
      previousAgent = currentAgent == "a" ? "B" : "A"
      $("#host-dialog").text(
        "Bankrot." + " Agent " + previousAgent +
              " gubi sve novce. Agent " +
              currentAgent.toUpperCase() +
              " vrti sljedeći."
      );
      spinWheel();
    }, 2000);
  } else {
    winPoints = indicatedSegment.text;
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
