// 2016-2017 Adam McFadyen / dabzo Interaction dabzo.com

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

app = {

  updateTimer: function() {
      var myTime = timer.innerHTML;
      var ss = myTime.split(':');
      var dt = new Date();
      dt.setHours(ss[0]);
      dt.setMinutes(ss[1]);
      dt.setSeconds(ss[2]);

      var dt2 = new Date(dt.valueOf() + 1000);
      var ts = dt2.toTimeString().split(' ')[0];
      timer.innerHTML = ts;
      window.timerTimeout = setTimeout(this.updateTimer, 1000);
  },

  inputParamsChanged: function(){
    app.cellsWide = document.getElementById('difficulty').value;
    app.cellsHigh = document.getElementById('difficulty').value;
    app.numVariants = document.getElementById('difficulty').value;
    app.numEachVariant = document.getElementById('difficulty').value;
    app.totalCells = (app.cellsWide * app.cellsHigh);
    app.totalVariants = (app.numVariants*app.numEachVariant);

    // cell_output.innerHTML = totalCells;
    // variant_output.innerHTML = totalVariants;

    // console.log('currentVariantCount',totalVariants);

    if (app.totalVariants == app.totalCells) {
      app.gameOn = true;
      // validation_notification.innerHTML = 'Your game looks perfect ' + numVariants + ' Variants x ' + numEachVariant;
      // validation_notification.innerHTML += ' of Each Variant fits perfectly on a ' + cellsWide + 'x' + cellsHigh + ' Grid';
    } else {
      if (app.totalVariants > app.totalCells) {
          app.gameOn = false;
          // validation_notification.innerHTML = '<strong class=\'error too-many-variants\'>' + numVariants + ' Variants x ' + numEachVariant;
          // validation_notification.innerHTML += ' of Each Variant is more than a ' + cellsWide + 'x' + cellsHigh + ' Grid can support.';
          // validation_notification.innerHTML += '<br> Please use fewer variants or a larger grid.</span>';
      } else {
        if (app.totalVariants < app.totalCells) {
          app.gameOn = true;
          // validation_notification.innerHTML = 'Looking good! But You have some empty-cells.<br> You can add more ';
          // validation_notification.innerHTML += 'variants, more of each variant... or just play the game!';
        } else {
        app.gameOn = false;
          // validation_notification.innerHTML = '&nbsp';
        }
      }
    }

    app.matchScore = 0;
    app.allMatched = [];
    app.clickedCells = [];
    app.completeMatches = [];
    app.output.innerHTML = '&nbsp;';

    app.clear_children(container_wrapper);
    app.theVariants = app.build_variants(app.numVariants, app.numEachVariant);
    app.plot(app.container_wrapper,app.cellsWide,app.cellsHigh,app.numVariants,app.numEachVariant);
    app.addCellListeners();
    app.resetTimer();
  },

  clear_children: function(target){
    while (target.firstChild) {
      target.removeChild(target.firstChild);
    }
  },

  getRandomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  build_variants: function(num_variants, num_each_variant){
    variantList = [];
    for(x=0;x<=num_variants;x++){
      variantList.push([]);
      variantList[x].push('variant_'+x);
      variantList[x].push(num_each_variant);
    }
    return variantList;
  },

  assign_variant: function(elem, variant_list, num_variants){
    currentVariant = this.getRandomInt(0,num_variants);

    if(app.totalVariants){
      currentVariant = this.getRandomInt(0,num_variants);
      // +1 to randomInt limit for buffer cells (bonus, traps, etc...)
      if(app.theVariants[currentVariant][1]>0){
        currentVariantCount = app.theVariants[currentVariant][1];
        elem.className = elem.className+' variant_'+currentVariant;
        app.theVariants[currentVariant][1] = (app.theVariants[currentVariant][1]-1);
        app.totalVariants--;
      }else{
        this.assign_variant(elem, variants, num_variants);
      }
    }else{
      elem.className = elem.className+' variant_empty';
    }
    // console.log(currentVariantCount,totalVariants);
  },


  // window.localStorage.removeItem( 'dabzo_Memory_Game_HighScores' );
  saveHighScore: function(score,time){

    var highScoresData = window.localStorage.getItem('dabzo_Memory_Game_HighScores');
    if( highScoresData ){
      var newHighScoresData = JSON.stringify( {'score':score,'time':time} );
      var newHighScoresObject = JSON.parse( highScoresData );
      var scoreSize = Object.size(newHighScoresObject);

      newHighScoresObject[ scoreSize + 1 ] = newHighScoresData;
    } else {
      var newHighScoresData = JSON.stringify( {'score':score,'time':time} );
      var newHighScoresObject = {};

      newHighScoresObject[1] = newHighScoresData;
    }
    window.localStorage.setItem( 'dabzo_Memory_Game_HighScores', JSON.stringify( newHighScoresObject ) );

  },




  // function fixErrorsModal() {
  	//   alert('Please fix game config before playing');
  // }

  clickCell: function(){
    // todo add 'empty' exception in rand# +1 to max include 'empty' before indexes reach 0
    if (app.gameOn == false) {
      app.fixErrorsModal();
      return;
    };
    var self = this;
    var itMatched = false;
    var pushCell = true;
    var chainMatches = false;

    var varClassRe = /variant_\d+/;varClass = varClassRe.exec(self.className);
    var varCellRe = /cell_\d+_\d+/;varCell = varCellRe.exec(self.className);

    for(i=0;i<app.clickedCells.length;i++){
      if(varCell==app.clickedCells[i][0]){
        pushCell = false;
      }
    }

    if(pushCell){
      app.allMatched.push(varClass);
      app.clickedCells.push(varCell);
    }

    for(i=0;i<app.allMatched.length;i++){
      if(app.allMatched[0][0]==app.allMatched[i][0]){
        itMatched = true;
      }else{
        itMatched = false;
      }
    }

    if(app.allMatched.length == app.numEachVariant){
      app.completeMatches.push(app.allMatched);
      app.allMatched = [];
    }

    // console.log('clicked variants: '+allMatched, ' & clicked cells: '+clickedCells);
    output.innerHTML = ' -  clicked variants: '+app.allMatched, ' & clicked cells: '+app.clickedCells;

    /* drop or keep score on previous cell click - consider toggle */
    if(itMatched == true && pushCell == false){
      app.matchScore = 0;
      app.allMatched = [];
      app.clickedCells = [];
      app.completeMatches = [];
      output.innerHTML = 'You clicked that one already! Try Again';
      app.resetTimer();
    }else if(itMatched == true){
      app.matchScore++;
      var responseEncouragement = [
        'Win!', 'Epic!', 'Great!', 'Sweet!', 'Awesome!', 'Fantastic!', '#likeaboss', 'Ya done good.', 'You Rule!', 'Nicely Done!',
        'Whoaly Crow!', 'Boo Yeah!', 'Good One!', 'Nice One!', 'Rock Star!', 'Very Good!', 'Way to Go!', 'Top Knotch!',
      ];
      var winPhrase = responseEncouragement[Math.floor(Math.random() * responseEncouragement.length)];
      output.innerHTML = winPhrase+' '+app.matchScore+' in a row';
      // output.innerHTML += '<br>clickedCells: '+clickedCells;
      // output.innerHTML += '<br>allMatched: '+allMatched;
      // output.innerHTML += '<br>completeMatches: '+completeMatches;
      console.log(app.completeMatches);

      if(app.completeMatches.length == app.numVariants){
        var matchTime = timer.innerHTML;
        output.innerHTML += '<div id="game_complete">Game Complete! You made '+app.matchScore+' correct selections in '+matchTime+'</div>';
        output.innerHTML += '<div id="play_again">Play Again? Select a different difficulty level!</div>';

        app.saveHighScore(app.matchScore,app.matchTime);

        app.matchScore = 0;
        app.allMatched = [];
        app.clickedCells = [];
        app.completeMatches = [];

        app.resetTimer();

        // todo: add new-game button to init.
        // var play_again = document.getElementById('play_again');
        // play_again.addEventListener('click', window.location.reload(), false);

      }
    }else{
      app.matchScore = 0;
      app.allMatched = [];
      app.clickedCells = [];
      app.completeMatches = [];
      app.output.innerHTML = 'Sorry! Try Again';
      app.resetTimer();
    }
  },

  resetTimer: function(){
    window.clearTimeout(timerTimeout);
    document.getElementById('timer').innerHTML = '00:00:00';
    window.timerTimeout = setTimeout(app.updateTimer, 1000);
  },

  plot: function(container, cellswide, cellshigh, num_variants, num_each_variant){

    variants = app.theVariants;

    for(x=0;x<cellshigh;x++){

      var lengthContainer = document.createElement('div');

      container.style.height = app.gameHeight+'px';
      container.style.width = app.gameWidth+'px';

      container.appendChild(lengthContainer);
        lengthContainer.style.width = '100%';
        lengthContainer.style.height = (app.gameHeight/app.cellshigh)+'px';
        lengthContainer.id = 'length_'+x;
        lengthContainer.className = 'length num'+x;

      // This variable must be cast after .appendChild(lengthContainer)
      var lengthCurrent = document.getElementById('length_'+x);

      for(y=0;y<cellswide;y++){

        var cellContainer = document.createElement('div');

        lengthCurrent.appendChild(cellContainer);
          cellContainer.style.width = (app.gameWidth/cellswide)+'px';
          cellContainer.style.height = (app.gameHeight/cellshigh)+'px';
          cellContainer.id = 'cell_'+x+'_'+y;
          cellContainer.className = 'cell cell_'+x+'_'+y;

        app.cellList.push([]);
        cellCoords = (x * cellswide) + y;

        app.cellList[cellCoords].push('cell_'+x+'_'+y);
        app.cellList[cellCoords].push(num_variants);

        this.assign_variant(cellContainer, variants, num_variants);
        //console.log(cellList);assign_variant(cellContainer);
      }
    }
  },

  addCellListeners: function(){
    var cellElems = container_wrapper.getElementsByClassName('cell');
    for (var i = 0; i < cellElems.length; i++) {
      cellElems[i].addEventListener('click', this.clickCell, false);
    }
  },

  // var
  gameWidth: document.getElementById('main').offsetWidth,
  gameHeight: this.gameWidth * 0.65,

  container_wrapper: document.getElementById('container_wrapper'),
  difficulty: document.getElementById('difficulty'),
  // cells_wide: document.getElementById('cells_high'),
  // cells_high: document.getElementById('cells_high'),
  // number_variants: document.getElementById('number_variants'),
  // number_each_variant: document.getElementById('number_each_variant'),
  // cell_output: document.getElementById('cell_output'),
  // variant_output: document.getElementById('variant_output'),
  validation_notification: document.getElementById('validation_notification'),
  output: document.getElementById('output'),
  timer: document.getElementById('timer'),

  cellsWide: this.difficulty.value,
  cellsHigh: this.difficulty.value,
  numVariants: this.difficulty.value,
  numEachVariant: this.difficulty.value,
  totalCells: (this.cellsWide * this.cellsHigh),
  totalVariants: (this.numVariants*this.numEachVariant),
  

  variantClasses: [],
  cellList: [],
  matchScore: 0,
  allMatched: [],
  clickedCells: [],
  completeMatches: [],

  theVariants: [],

  gameOn: false,

  init: function(){
    // var
    app.gameWidth=document.getElementById('main').offsetWidth;
    app.gameHeight=app.gameWidth * 0.65;

    app.container_wrapper=document.getElementById('container_wrapper');
    app.difficulty=document.getElementById('difficulty');
    // app.cells_wide=document.getElementById('cells_high');
    // app.cells_high=document.getElementById('cells_high');
    // app.number_variants=document.getElementById('number_variants');
    // app.number_each_variant=document.getElementById('number_each_variant');
    // app.cell_output=document.getElementById('cell_output');
    // app.variant_output=document.getElementById('variant_output');
    app.validation_notification=document.getElementById('validation_notification');
    app.output=document.getElementById('output');
    app.timer=document.getElementById('timer');

    app.cellsWide= app.difficulty.value;
    app.cellsHigh= app.difficulty.value;
    app.numVariants= app.difficulty.value;
    app.numEachVariant= app.difficulty.value;
    app.totalCells=(app.cellsWide * app.cellsHigh);
    app.totalVariants=(app.numVariants*app.numEachVariant);
    

    app.variantClasses=[];
    app.cellList=[];
    app.matchScore=0;
    app.allMatched=[];
    app.clickedCells=[];
    app.completeMatches=[];

    app.theVariants = app.build_variants(app.numVariants, app.numEachVariant),

    /**/
    // cell_output.innerHTML = totalCells;
    // variant_output.innerHTML = totalVariants;

    app.gameOn = false;
    if (app.totalVariants == app.totalCells) {
      app.gameOn = true;
      // validation_notification.innerHTML = 'Your game looks perfect ' + numVariants + ' Variants x ' + numEachVariant;
      // validation_notification.innerHTML += ' of Each Variant fits perfectly on a ' + cellsWide + 'x' + cellsHigh + ' Grid';
    } else {
      if (app.totalVariants > app.totalCells) {
        // validation_notification.innerHTML = numVariants + ' Variants x ' + numEachVariant + ' of Each Variant is more than a ';
        // validation_notification.innerHTML += cellsWide + 'x' + cellsHigh + ' Grid can support.<br> Please use fewer variants or a larger grid.';
      } else {
        if (app.totalVariants < app.totalCells) {
          app.gameOn = true;
          // validation_notification.innerHTML = 'Looking good! But You have some empty-cells.<br> You can add more variants, more of each variant... ';
          // validation_notification.innerHTML += 'or just play the game!';
        } else {
          // validation_notification.innerHTML = '&nbsp;';
        }
      }
    }

    // document.getElementById('hide_config').addEventListener('change', function(){
      //   document.getElementById('config_container').classlist.toggle('hide');
      //   document.getElementById('hide_config').classlist.toggle('config-hidden');
    // });

    app.container_wrapper.addEventListener('change', app.inputParamsChanged);
    app.difficulty.addEventListener('change', app.inputParamsChanged);
    // cells_wide.addEventListener('change', inputParamsChanged);
    // cells_high.addEventListener('change', inputParamsChanged);
    // number_variants.addEventListener('change', inputParamsChanged);
    // number_each_variant.addEventListener('change', inputParamsChanged);



    app.plot(app.container_wrapper, app.cellsWide, app.cellsHigh, app.numVariants, app.numEachVariant);
    app.addCellListeners();
    document.timerTimeout = setTimeout(app.updateTimer, 1000);
    output.innerHTML = '&nbsp;';
  },

  initialize: function() {
      document.addEventListener('deviceready', app.init.bind(this), false);
  },
}

app.initialize();
