const renderer = PIXI.autoDetectRenderer({
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio,
    width: 320,  //intial, resize as required later
    height: 256, //intial, resize as required later
    backgroundColor: 0x808000,
    autoResize: true,
});

let stage, tilemap;
let frame = 0;
let bulldozerRow, bulldozerCol; //bulldozer's position is populated once map level is loaded
let size = 16;  //tile size, resize as required later
let levelSetArray=[], levelArray = [];
let mapArray=[];
let lastMoveArray = [];
let currentLevel=0, levelSet=-1;
let levelSolved=false;

/*Congratulatory messages upon completion of a level.  Would cycle through them */
const messages = ['Good job!', 'Awesome!', 'Props!', 'Way to go!', 'Nailed it!', 'Good Game!', 'Kudos!', 'Hats off!', 'A round of applause...', 'Keep going!', 'Slow poke..', 'Slow down!', 'Nice!', 'Take it easy on the caffeine, sheeez', 'Almost there..', 'Boom!', 'Yay, now take a break!', 'Okay, take a stretch now!', 'You do not give up, nice!', 'Bazinga!']; 

const maxRows = 16;
const maxCols = 20;
let unfillSum, fillSum, bullseyeSum; //variables set once map level is loaded

//initial load of mapArray
createMapArray(maxRows, maxCols);

//load level 0 when application starts for the first time
loadMap(0);

//attach PIXI renderer view to canvas DOM element
document.getElementById("canvas").appendChild(renderer.view);

const loader = new PIXI.Loader();


/*shortcut to find the best tilemap size for the device's viewport */ 
let css_width = window.innerWidth;
if(css_width>=640){
  renderer.resize(640,512);
  size=32;
  loader.add('TilemapLegend', 'assets/TilemapLegend32.json'); //32px
}
else if(css_width<640 && css_width>=480){
  renderer.resize(480,384);
  size=24;
  loader.add('TilemapLegend', 'assets/TilemapLegend24.json'); //24px
}
else{
  loader.add('TilemapLegend', 'assets/TilemapLegend16.json'); //16px
}

loader.load((_, resources) => {
    // Setup tilemap scene
    stage = new PIXI.Container();
    tilemap = new PIXI.tilemap.CompositeTilemap();
    stage.addChild(tilemap);

    // Setup rendering loop
    PIXI.Ticker.shared.add(() => renderer.render(stage));
  
    makeTilemap();

});


var modal = document.getElementById("myModal"); // Get the modal
let span = document.getElementsByClassName("close")[0]; //Get the <span> element that closes the modal



function makeTilemap() {
    // Clear the tilemap, in case it is being reused.
    tilemap.clear();

    fillSum =0;

    /*fill tilemap*/
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 16; j++) {
              let index = mapArray[j][i];
  
              //wall condition  
              if (index < 0){
                  if (index === -8) tilemap.tile('brick8.png',i * size, j * size);
                  else if (index === -7) tilemap.tile('brick7.png',i * size, j * size);
                  else if (index === -6) tilemap.tile('brick6.png',i * size, j * size);
                  else if (index === -5) tilemap.tile('brick5.png',i * size, j * size);
                  else if (index === -4) tilemap.tile('brick4.png',i * size, j * size);
                  else if (index === -3) tilemap.tile('brick3.png',i * size, j * size);
                  else if (index === -2) tilemap.tile('brick2.png',i * size, j * size);
                  else tilemap.tile('brick1.png',i * size, j * size);
              }
         
              //non-wall condition
              else if (index > 0){ 
                  if (index === 1) tilemap.tile('bullseye.png',i * size, j * size);
                  else if (index === 2) tilemap.tile('boulder.png',i * size, j * size);
                  else if (index === 3){
                      tilemap.tile('bullseye-boulder.png',i * size, j * size);
                      fillSum++; //accounting of oddities on the initial map
                  }
                  else{
                      if (index%10 === 4) tilemap.tile('bulldozer-up.png',i * size, j * size);
                      else if (index%10 === 5) tilemap.tile('bulldozer-down.png',i * size, j * size);
                      else if (index%10 === 6) tilemap.tile('bulldozer-left.png',i * size, j * size);
                      else tilemap.tile('bulldozer-right.png',i * size, j * size);
                      bulldozerRow=j;  //get bulldozer postion
                      bulldozerCol=i;  //get bulldozer postion
                  }
              }  
              //do nothing
              else{}
        }
    }
}


async function createMapArray(a, b){
    for (let i = 0; i< a; i++) {
            mapArray[i] = [];        
    }

    //initialize for safe measure
    for (let i = 0; i< a; i++) {
        for(let j = 0; j< b; j++) {
            mapArray[i][j] = -4;
        }
    }
    return mapArray;
}

async function getMapSetData(levelSet) { /*fetch 10 map levels from the server - better than loading one for each new level*/
    let url = 'mapsets/' + levelSet + '.txt'
    try {
        let res = await fetch(url);
        if (res.status === 200) return await res.text();
        else console.log(res.status);
    }

    catch (error) {
        console.log(error);
    }
}

async function loadMap(levelNum) {
    if( Math.floor(levelNum/10) != levelSet){
       levelSet= Math.floor(levelNum/10); //find mapset to which the level belongs
       let mapSetData = await getMapSetData(levelSet);
       if (mapSetData!=null){
         levelSetArray = [];
         levelSetArray = mapSetData.split(/\r\n|\n\r|\n|\r/); //split mapset and place into an array
       }
       else{ 
           alert("Unable to fetch map data. Maybe try again?");
           return null;
       }
    }
    //error handling to be added**   
    loadLevelData(levelNum);
}

async function loadLevelData(levelNum) {
    levelArray = [];
    let levelPositionInArray = levelNum % 10;
    levelArray = levelSetArray[levelPositionInArray].split(/\s+/); //split map data and place into the level array

    let index = 0;
    bullseyeSum = 0; unfillSum = 0; fillSum=0;
    for (let i = 0; i < maxRows; i++) {
        for(let j = 0; j < maxCols; j++) {
            mapArray[i][j] = Number(levelArray[index++]);
            if(mapArray[i][j] === 1) unfillSum++;  //count initial empty bullseye
            if(mapArray[i][j] === 3) fillSum++;    //count initial bullseye with boulder
        }
    }
    currentLevel = levelNum;
    document.getElementById("level").textContent = "Level "+currentLevel;
    bullseyeSum = unfillSum + fillSum; //target number for filled bullseye
    levelSolved=false;
}

async function restartLevel() {
    await loadLevelData(currentLevel);
    makeTilemap();
}

async function undoLastMove() {
    mapArray[lastMoveArray[0]][lastMoveArray[1]] = lastMoveArray[2];
    mapArray[lastMoveArray[3]][lastMoveArray[4]] = lastMoveArray[5];
    mapArray[lastMoveArray[6]][lastMoveArray[7]] = lastMoveArray[8];
    makeTilemap();
}

async function jumpToLevel(level) {
    if(level){
      await loadMap(level);
      makeTilemap();
    }
}

function getLevel() {
  let level = prompt("Please enter a level number between 0 and 179, inclusive.");
  if ( !isNaN(level) && level>=0 && level<180 ) {
    jumpToLevel(level);
  }
  else alert("Please enter a valid level number. Stop trying to hack me with bad characters.");
}


document.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowUp' || event.key === 'w') {
    moveBulldozerUp();
  }
  else if (event.key === 'ArrowLeft' || event.key === 'a') {
    moveBulldozerLeft(); 
  }
  else if (event.key === 'ArrowRight' || event.key ===  'd') {
    moveBulldozerRight(); 
  }
  else if (event.key === 'ArrowDown' || event.key === 's') {
    moveBulldozerDown();
  }
  else return; //ignore other keys

});


function moveBulldozerUp(){
    let t0,t1,t2;
    let movement = false;

    t0 = mapArray[bulldozerRow][bulldozerCol];  //initial bulldozer position
    t1 = mapArray[bulldozerRow-1][bulldozerCol]; //first tile in the position bulldozer is pushing
    t2 = mapArray[bulldozerRow-2][bulldozerCol]; //second tile in the position bulldozer is pushing

    if(levelSolved) return;

     //a wall, just ignore
    if ( t1 < 0 ) return;

    //go into an empty tile   
    else if ( t1 === 0 ){
       mapArray[bulldozerRow-1][bulldozerCol] = 4;
       movement =true;
    }

    //go into a bullseye   
    else if ( t1 === 1 ){
       mapArray[bulldozerRow-1][bulldozerCol] = 14;
       movement =true;
    }

    //push boulder 
    else if ( t1 === 2 ){
       if ( t2 == 0 ){
          mapArray[bulldozerRow-1][bulldozerCol] = 4;
          mapArray[bulldozerRow-2][bulldozerCol] = 2;
          movement =true;
       }   
       else if ( t2 == 1 ){
          mapArray[bulldozerRow-1][bulldozerCol] = 4;
          mapArray[bulldozerRow-2][bulldozerCol] = 3;
          fillSum++;
          movement =true;
       }
       else return; 
    }

    //push bullseye-boulder 
    else{
       if ( t2 == 0 ){
          mapArray[bulldozerRow-1][bulldozerCol] = 14;
          mapArray[bulldozerRow-2][bulldozerCol] = 2;
          fillSum--; 
          movement =true;
       }   
       else if ( t2 == 1 ){
          mapArray[bulldozerRow-1][bulldozerCol] = 14;
          mapArray[bulldozerRow-2][bulldozerCol] = 3;
          movement =true;
       }
       else return; 
    }
    
    if (movement){
       lastMoveArray = [];
       //save state of the three tiles before bulldozer's successful move
       lastMoveArray.push(bulldozerRow,bulldozerCol,t0,bulldozerRow-1,bulldozerCol,t1,bulldozerRow-2,bulldozerCol,t2); 
    }

    updateT0Postion(t0); //update bulldozer position
}

function moveBulldozerLeft(){
    let t0,t1,t2;
    let movement = false;

    t0 = mapArray[bulldozerRow][bulldozerCol];    //initial bulldozer position
    t1 = mapArray[bulldozerRow][bulldozerCol-1];  //first tile in the position bulldozer is pushing
    t2 = mapArray[bulldozerRow][bulldozerCol-2];  //second tile in the position bulldozer is pushing

    if(levelSolved) return;
     
    //a wall, just ignore
    if ( t1 < 0 ) return;

    //go into a empty tile   
    else if ( t1 === 0 ){
       mapArray[bulldozerRow][bulldozerCol-1] = 6;
       movement =true;
    }

    //go into a bullseye   
    else if ( t1 === 1 ){
       mapArray[bulldozerRow][bulldozerCol-1] = 16;
       movement =true;
    }

    //push boulder 
    else if ( t1 === 2 ){
       if ( t2 == 0 ){
          mapArray[bulldozerRow][bulldozerCol-1] = 6;
          mapArray[bulldozerRow][bulldozerCol-2] = 2;
          movement =true;
       }   
       else if ( t2 == 1 ){
          mapArray[bulldozerRow][bulldozerCol-1] = 6;
          mapArray[bulldozerRow][bulldozerCol-2] = 3;
          fillSum++;
          movement =true;
       }
       else return; 
    }

    //push bullseye-boulder 
    else{
       if ( t2 == 0 ){
          mapArray[bulldozerRow][bulldozerCol-1] = 16;
          mapArray[bulldozerRow][bulldozerCol-2] = 2;
          fillSum--;
          movement =true;
       }   
       else if ( t2 == 1 ){
          mapArray[bulldozerRow][bulldozerCol-1] = 16;
          mapArray[bulldozerRow][bulldozerCol-2] = 3;
          movement =true;
       }
       else return; 
    }

    if (movement){
       lastMoveArray = [];
       //save state of the three tiles before bulldozer's successful move
       lastMoveArray.push(bulldozerRow,bulldozerCol,t0,bulldozerRow,bulldozerCol-1,t1,bulldozerRow,bulldozerCol-2,t2);
    }

    updateT0Postion(t0); //update bulldozer position
}

function moveBulldozerRight(){
    let t0,t1,t2;
    let movement = false;

    t0 = mapArray[bulldozerRow][bulldozerCol];   //initial bulldozer position   
    t1 = mapArray[bulldozerRow][bulldozerCol+1]; //first tile in the position bulldozer is pushing
    t2 = mapArray[bulldozerRow][bulldozerCol+2]; //second tile in the position bulldozer is pushing
    
    if(levelSolved) return;
     
    //a wall, just ignore
    if ( t1 < 0 ) return;

    //go into a empty tile   
    else if ( t1 === 0 ){
       mapArray[bulldozerRow][bulldozerCol+1] = 7;
       movement =true;
    }

    //go into a bullseye   
    else if ( t1 === 1 ){
       mapArray[bulldozerRow][bulldozerCol+1] = 17;
       movement =true;
    }

    //push boulder 
    else if ( t1 === 2 ){
       if ( t2 == 0 ){
          mapArray[bulldozerRow][bulldozerCol+1] = 7;
          mapArray[bulldozerRow][bulldozerCol+2] = 2;
          movement =true;
       }   
       else if ( t2 == 1 ){
          mapArray[bulldozerRow][bulldozerCol+1] = 7;
          mapArray[bulldozerRow][bulldozerCol+2] = 3;
          fillSum++;
          movement =true;
       }
       else return; 
    }

    //push bullseye-boulder 
    else{ // if ( t1 === 3 ){
       if ( t2 == 0 ){
          mapArray[bulldozerRow][bulldozerCol+1] = 17;
          mapArray[bulldozerRow][bulldozerCol+2] = 2;
          fillSum--;
          movement =true;
       }   
       else if ( t2 == 1 ){
          mapArray[bulldozerRow][bulldozerCol+1] = 17;
          mapArray[bulldozerRow][bulldozerCol+2] = 3;
          movement =true;
       }
       else return; 
    }

    if (movement){
       lastMoveArray = [];
       //save state of the three tiles before bulldozer's successful move
       lastMoveArray.push(bulldozerRow,bulldozerCol,t0,bulldozerRow,bulldozerCol+1,t1,bulldozerRow,bulldozerCol+2,t2);
    }
    updateT0Postion(t0);//update bulldozer position
}

function moveBulldozerDown(){
    let t0,t1,t2;
    let movement = false;

    t0 = mapArray[bulldozerRow][bulldozerCol];   //initial bulldozer position
    t1 = mapArray[bulldozerRow+1][bulldozerCol]; //first tile in the position bulldozer is pushing
    t2 = mapArray[bulldozerRow+2][bulldozerCol]; //second tile in the position bulldozer is pushing

    if(levelSolved) return;
     
    //a wall, just ignore
    if ( t1 < 0 ) return;

    //go into a empty tile   
    else if ( t1 === 0 ){
       mapArray[bulldozerRow+1][bulldozerCol] = 5;
       movement =true;
    }

    //go into a bullseye   
    else if ( t1 === 1 ){
       mapArray[bulldozerRow+1][bulldozerCol] = 15;
       movement =true;
    }

    //push boulder 
    else if ( t1 === 2 ){
       if ( t2 == 0 ){
          mapArray[bulldozerRow+1][bulldozerCol] = 5;
          mapArray[bulldozerRow+2][bulldozerCol] = 2;
          movement =true;
       }   
       else if ( t2 == 1 ){
          mapArray[bulldozerRow+1][bulldozerCol] = 5;
          mapArray[bulldozerRow+2][bulldozerCol] = 3;
          fillSum++;
          movement =true;
       }
       else return; 
    }

    //push bullseye-boulder 
    else{ // if ( t1 === 3 ){
       if ( t2 == 0 ){
          mapArray[bulldozerRow+1][bulldozerCol] = 15;
          mapArray[bulldozerRow+2][bulldozerCol] = 2;
          fillSum--;
          movement = true;
       }   
       else if ( t2 == 1 ){
          mapArray[bulldozerRow+1][bulldozerCol] = 15;
          mapArray[bulldozerRow+2][bulldozerCol] = 3;
          movement = true;
       }
       else return; 
    }

    if (movement){
       lastMoveArray = [];
       //save state of the three tiles before bulldozer's successful move
       lastMoveArray.push(bulldozerRow,bulldozerCol,t0,bulldozerRow+1,bulldozerCol,t1,bulldozerRow+2,bulldozerCol,t2);
    }
    
    updateT0Postion(t0);//update bulldozer position
}


function updateT0Postion(t0){  
  if ( t0 > 10) mapArray[bulldozerRow][bulldozerCol] = 1; //bulldozer comes off a bullseye
  else mapArray[bulldozerRow][bulldozerCol]=0; //else bulldozer leaves an empty tile
  makeTilemap();

  if(fillSum === bullseyeSum) { //all bullseye filled
    levelSolved=true;
    let nextLevel = Number(currentLevel)+1;
    let congratsIndex = currentLevel%20;
    setTimeout(() => {
      conVal = confirm(messages[congratsIndex] + "\n\nLoading level "+nextLevel+" now...");
      if (conVal){
        jumpToLevel(nextLevel);
      }
    }, 1000);
  }
}

function showAbout() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
