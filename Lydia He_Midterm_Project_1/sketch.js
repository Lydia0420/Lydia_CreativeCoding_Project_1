let bubbles = []; 
let candies = [];
let spatters = []; 
let explosionBubbles = [];
let explosion = false; 
let dropped = 0; //Number of candies dropped into the bottle


function setup() {
  createCanvas(600, 800);
  background(255, 150, 120); 

  drawBottle();

  // initial bubble
  for (let i = 0; i < 20; i++) {
    bubbles.push(new Bubble(random(180, 380), random(480, 680)));
  }
  
  // initial candy
  candies.push(new Candy(100, 750, '#AAE6FE', '#71C5E8'));
  candies.push(new Candy(180, 750, '#AEEBDA', '#71E8B4'));
  candies.push(new Candy(260, 750, '#AAE6FE', '#71C5E8'));
  candies.push(new Candy(340, 750, '#AAE6FE', '#71C5E8'));
  candies.push(new Candy(420, 750, '#98FB98', '#00FA9A'));
 }

function draw() {
  background(255, 150, 120);
  drawBottle();
  
  let offsetX = 0;
  let offsetY = 0;

  if (explosion) {   //Apply random displacement
    offsetX = random(-5, 5);
    offsetY = random(-3, 3);
  }
  
    push(); 
    translate(offsetX, offsetY); 
    drawBottle();
    drawLabel();   
    pop(); 
  
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].move();
    bubbles[i].display();
    
    // If bubbles reache top, reset to the bottom
    if (bubbles[i].y < 225) {
      bubbles[i].reset();
    }
  }
  
  // Check if all the candies fall into the bottle
  if (dropped >= 5 && !explosion) {
    // triggerExplosion(); // 触发爆发效果
    explosion = true;     // Trigger explosion effect
  }
  
  if (explosion) {
    triggerExplosion();
  }
  
  // Spatter
  for (let i = spatters.length - 1; i >= 0; i--) {
    spatters[i].move();
    spatters[i].display();
    // 移除已经完成的颗粒
    if (spatters[i].isFinished()) {
      spatters.splice(i, 1);
    }
  }
  
  // Explosion Bubbles
  for (let i = explosionBubbles.length - 1; i >= 0; i--) {
    explosionBubbles[i].move();
    explosionBubbles[i].display();
    // 移除消失的气泡
    if (explosionBubbles[i].isFinished()) {
      explosionBubbles.splice(i, 1);
    }
  }
  
  // Draw Label again to make the bubbles are covered
  push();
  translate(offsetX, offsetY); 
  drawLabel(); 
  pop(); 
  
    // Candy is located at the top
    for (let i = 0; i < candies.length; i++) {
    candies[i].move();
    candies[i].display();
      
    // Removed candies falling up the bottle cap
    if (candies[i].isOutOfBottle()) {
        dropped++; 
        candies.splice(i, 1);  
        i--;  
    }
  }
}

class Candy {
  constructor(x, y, color1, color2) {
    this.x = x;
    this.y = y;
    this.color1 = color1;    // dark
    this.color2 = color2;    // light
    this.isDragging = false; // Detect if candy is being dragged
    this.falling = false
    this.radius = 40; 
  }

   display() {
    noStroke();
    fill(this.color1); 
    beginShape();
    vertex(this.x, this.y);
    bezierVertex(this.x - 20, this.y + 50, this.x + 100, this.y + 30, this.x + 80, this.y);    // dpwn half
    bezierVertex(this.x + 65, this.y - 30, this.x + 10, this.y - 20, this.x, this.y);         // up half
    endShape(CLOSE);
    fill(this.color2); 
    beginShape();
    vertex(this.x - 2, this.y + 5);
    bezierVertex(this.x - 20, this.y + 50, this.x + 100, this.y + 30, this.x + 80, this.y);   // dpwn half
    bezierVertex(this.x + 50, this.y - 20, this.x + 10, this.y - 10, this.x, this.y);        // up half
    endShape(CLOSE);
    
    // highlights
    fill(255);
    ellipse(this.x + 53, this.y - 11, 10, 6);
  }
  
  // Detect if the mouse is over the candy
  overCandy() {
    let d = dist(mouseX, mouseY, this.x + 40, this.y); 
    return d < this.radius; 
  }
  
  move() {
    if (this.falling) {
      this.y += 5;
   }else if (this.isDragging) {
      this.x = mouseX - 40; 
      this.y = mouseY; 
    }
  }
  
  startDragging() {
    if (this.overCandy()) {
      this.isDragging = true;
    }
  }
  stopDragging() {
    this.isDragging = false;
    if (this.y < 130 && this.x > 220 && this.x < 330) {
      this.falling = true; // If candy above the bottle cap, start falling
  }
}

  isOutOfBottle() {
    let bottleCapY = 75; 
    // return this.y > bottleCapY && this.falling; // 如果糖果掉落并超过瓶口位置，移除糖果
    if (this.y > bottleCapY && this.falling) {
      // spatter effect
      for (let i = 0; i < 15; i++) { 
        spatters.push(new Spatter(this.x + 40, bottleCapY)); 
      }
      return true;
    }
    return false;
  }
}

// Start dragging the candy when the mouse is pressed
function mousePressed() {
  for (let i = 0; i < candies.length; i++) {
    candies[i].startDragging();
  }
}
function mouseReleased() {
  for (let i = 0; i < candies.length; i++) {
    candies[i].stopDragging();
  }
}

class Spatter {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(5, 15); 
    this.speedX = random(-2, 2); 
    this.speedY = random(-5, -2); 
    this.alpha = 255;
  }
  
  move() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.1; // simulate gravity
    this.alpha -= 5; 
  }
  
  display() {
    noStroke();
    fill(255, this.alpha); 
    ellipse(this.x, this.y, this.size);
  }

  isFinished() {
    return this.alpha <= 0; 
  }
}

class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(10, 20);
    this.speed = random(1, 3);   
  }
  
  move() {
    this.y -= this.speed; // Bubbles move up
    this.size += 0.05;    // Bubbles get bigger
  }

  display() {
    noStroke();
    fill(255, 200); // color translucent
    ellipse(this.x, this.y, this.size);
  }

  reset() {
    // Reset bubble position
    this.y = random(480, 680); 
    this.x = random(180, 375); 
    this.size = random(10, 20); 
    this.speed = random(1, 3); 
  }
}

class ExplosionBubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(10, 25); 
    this.speedX = random(-2, 2);  // shuffling
    this.speedY = random(-8, -4); // run up
    this.alpha = 255; 
  }
  
  move() {
    this.x += this.speedX; 
    this.y += this.speedY; 
    // this.speedY += 0.2; // 增加重力效果
    this.alpha -= 4; 
  }
  
  display() {
    noStroke();
    fill(255, this.alpha); 
    ellipse(this.x, this.y, this.size);
  }
  
  isFinished() {
    return this.alpha <= 0; 
  }
}

function triggerExplosion() {
  // 生成大量气泡从瓶口喷出
  let bottleCapXStart = 210; 
  let bottleCapXEnd = 320; 
  for (let i = 0; i < 100; i++) {
    let x = random(bottleCapXStart, bottleCapXEnd); // Affects the lateral distribution range of bubbles
    let y = random(5, 85); 
    explosionBubbles.push(new ExplosionBubble(x, y)); 
  }
}



//bottle
function drawBottle() {
  stroke(255); 
  strokeWeight(5); 
  noFill(); 
  
  beginShape();
  vertex(220, 130); // Start point at the top
  bezierVertex(130, 200, 110, 280, 170, 330); // Left side of the bottle
  bezierVertex(170, 330, 170, 480, 170, 480); 
  bezierVertex(100, 630, 170, 680, 180, 680); 
  
  bezierVertex(220, 690, 225, 690, 230, 680); // Bottom curve
  bezierVertex(250, 710, 315, 710, 330, 680); 
  bezierVertex(340, 690, 345, 690, 380, 680); 
  
  bezierVertex(380, 680, 450, 630, 380, 480); // Right side of the bottle
  bezierVertex(380, 480, 380, 330, 380, 330); 
  bezierVertex(440, 270, 410, 190, 330, 130); 
  
  endShape(CLOSE); 

  // bottle cap
  strokeWeight(0); 
  fill(255); 
  rect(220, 75, 110, 55, 5, 5, 0, 0); 
  
  fill(180);
  push();                  //Grey 1
  translate(216, 82); 
  rotate(radians(8)); 
  rect(0, 0, 122, 10, 3); 
  pop();
  
  push();                 //Grey 2
  translate(215, 100);
  rotate(radians(8)); 
  rect(0, 0, 121, 10, 3); 
  pop();
  
  // Black drink
  fill(0); 
  stroke(0);
  strokeWeight(3);
    
  beginShape();
  vertex(147, 225); // 波浪线的起点
  bezierVertex(160, 240, 175, 245, 200, 225); // 第一段波浪
  bezierVertex(208, 220, 220, 220, 230, 225); 
  bezierVertex(260, 240, 270, 240, 285, 225); 
  bezierVertex(300, 210, 315, 230, 330, 230); 
  bezierVertex(380, 210, 360, 250, 402, 225); // 第五段波浪
  
  bezierVertex(410, 245, 415, 290, 378, 328); 
  bezierVertex(378, 330, 300, 330, 175, 330);  //直线
  bezierVertex(150, 310, 128, 278, 147, 225); 
  endShape();

  beginShape();
  vertex(172, 480); // Start point
  bezierVertex(102, 630, 174, 680, 184, 678); // Left side of the bottle
  bezierVertex(216, 686, 225, 688, 230, 678); // Bottom curve
  bezierVertex(250, 706, 313, 708, 330, 678); 
  bezierVertex(340, 686, 345, 688, 378, 677); 
  bezierVertex(378, 679, 446, 628, 375, 478); // Right side of the bottle
  endShape(CLOSE); 
  
  // Grey drink
  fill("#E1E1E1"); 
  stroke("#E1E1E1");
  strokeWeight(3);
  beginShape();
  vertex(147, 224); // 波浪线的起点
  bezierVertex(160, 240, 175, 245, 200, 225); // 第一段波浪
  bezierVertex(208, 220, 220, 220, 230, 225); 
  bezierVertex(260, 240, 270, 240, 285, 225); 
  bezierVertex(300, 210, 315, 230, 330, 230); 
  bezierVertex(380, 210, 360, 250, 402, 225); // 第五段波浪
  
  bezierVertex(399, 210, 375, 175, 381, 184); 
   bezierVertex(380, 180, 360, 167, 330, 190); //上面波浪
   bezierVertex(310, 200, 285, 190, 270, 185); 
   bezierVertex(245, 175, 240, 185, 230, 190);
   bezierVertex(218, 200, 205, 200, 198, 195);
   bezierVertex(170, 170, 168, 195, 166, 189);
  bezierVertex(153, 210, 150, 215, 147, 224); 
  endShape();
  
  noFill(); 
  stroke("#d9a59a"); 
  strokeWeight(3); 
  arc(170, 220, 10, 3, 0, PI);
  arc(220, 205, 8, 3, 0, PI);
  arc(250, 215, 10, 4, 0, PI);
  arc(300, 208, 10, 4, 0, PI);
  arc(355, 190, 11, 4, 0, PI);
  arc(380, 220, 7, 3, 0, PI);
}

// blue label
function drawLabel() {
  fill("#738CD9");
  noStroke();
  rect(172.5, 330, 205, 150);
  
  // smiley
  fill("#F2B84B");
  ellipse(275, 405, 90, 90);
    // eyes
  fill(0); 
  ellipse(260, 390, 10, 10); // left
  ellipse(290, 390, 10, 10); // right
   // mouth
  noFill(); 
  stroke(0); 
  strokeWeight(3); 
  arc(275, 405, 40, 30, 0, PI);
}  
