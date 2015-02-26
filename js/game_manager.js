function GameManager(size, InputManager, Actuator) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.actuator     = new Actuator;

  this.running      = false;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));

  this.inputManager.on('think', function() {
    var best = this.ai.getBest();
    this.actuator.showHint(best.move);
  }.bind(this));


  this.inputManager.on('run', function() {
    if (this.running) {
      this.running = false;
      this.actuator.setRunButton('交给我吧');
    } else {
      this.running = true;
      this.run()
      this.actuator.setRunButton('你自己来');
    }
  }.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  if (this.won) {
      //window.navigate("timeline.html");
      window.location.href="timeline.html";
	    //document.write('<!DOCTYPE html><html lang="en"><head><title>Our Trip</title><meta charset="utf-8"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-touch-fullscreen" content="yes"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"><style>html, body {height:100%;padding: 0px;    margin: 0px;    }   </style><script type="text/javascript" src="build/js/jquery.min.js"></script>  </head>  <body>    <div id="timeline-embed"></div>      <script type="text/javascript">        var timeline_config = {         width: "100%",         height: "100%",         source: "https://docs.google.com/spreadsheet/pub?key=0AkMdj0hth5RYdEZIR25PQ3V3NWRaajREZGlGY0pYX1E&output=html",		 lang:               "zh-cn", debug:true        }      </script>      <script type="text/javascript" src="build/js/storyjs-embed.js"></script>  </body></html>');
	    //document.write("<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Our Trip</title></head><iframe src='http://cdn.knightlab.com/libs/timeline/latest/embed/index.html?source=0AkMdj0hth5RYdEZIR25PQ3V3NWRaajREZGlGY0pYX1E&font=Bevan-PotanoSans&maptype=toner&lang=en&hash_bookmark=true&height=650' width='100%' height='650' frameborder='0'></iframe></html>");
  } else {
      this.actuator.restart();
      this.running = false;
      this.actuator.setRunButton('交给我吧');
      this.setup();
  }

};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid         = new Grid(this.size);
  this.grid.addStartTiles();

  this.ai           = new AI(this.grid);

  this.score        = 0;
  this.over         = false;
  this.won          = false;

  // Update the actuator
  this.actuate();
};


// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    score: this.score,
    over:  this.over,
    won:   this.won
  });
};

// makes a given move and updates state
GameManager.prototype.move = function(direction) {
  var result = this.grid.move(direction);
  this.score += result.score;

  if (!result.won) {
    if (result.moved) {
      this.grid.computerMove();
    }
  } else {
    this.won = true;
  }

  //console.log(this.grid.valueSum());

  if (!this.grid.movesAvailable()) {
    this.over = true; // Game over!
  }

  this.actuate();
}

// moves continuously until game is over
GameManager.prototype.run = function() {
  var best = this.ai.getBest();
  this.move(best.move);
  var timeout = animationDelay;
  if (this.running && !this.over && !this.won) {
    var self = this;
    setTimeout(function(){
      self.run();
    }, timeout);
  }
}
