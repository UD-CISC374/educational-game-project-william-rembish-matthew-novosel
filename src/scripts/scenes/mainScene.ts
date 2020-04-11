import Player from '../objects/player';
import command from '../objects/command';

export default class MainScene extends Phaser.Scene {
  // the player
  private player: Player;

  // temporary values for enemies
  private knight: Phaser.Physics.Arcade.Sprite;
  private enemy_exists: boolean;  
  private EnemyisFlipped: boolean;
  private enemy_health: number;

  // the background
  private background: Phaser.GameObjects.TileSprite;

  // the players typing input as a string
  private words: string;

  // the bitmap texts that display to the screen
  private wordLabel: Phaser.GameObjects.BitmapText;
  private healthLabel: Phaser.GameObjects.BitmapText;
  private commandDisplay: Phaser.GameObjects.BitmapText;

  // Command storage 
  private allComs: Array<command>;
  private commands: string[];
  private command_map: Map<string, [string, boolean]>;

  // the constructor for the scene
  constructor() {
    super({ key: 'MainScene' });
  }

  // init function. Allows passing the player object between scenes
  init(data) {
    // initiate the background as the back most image
    this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "background");
    this.background.setOrigin(0, 0);

    // inititates the enemy over top the background
    this.knight = this.physics.add.sprite(250, 100, "knight-idle");
    this.knight.play("knight-idle");
    this.enemy_health = 10;
    this.enemy_exists = true;

    // check if the player is passed from another scene
    if (data.player == undefined) {
      // if the player isn't passed, initiate the default player
      this.player = new Player(this, this.scale.width / 2 - 8, this.scale.height - 64);
    } else {
      // if the player is passed from another scene, create the player over top the background
      this.player = new Player(this, data.player.x, data.player.y);
      // use the function in the player object to transfer all the important data from the passed player to the scene's player
      this.player.make_player(data.player);
    }
  }

  // create function for the scene
  create() {
    // add the necessary input keys for the player to type
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    for (let i: number = Phaser.Input.Keyboard.KeyCodes.A; i <= Phaser.Input.Keyboard.KeyCodes.Z; i++) {
      this.input.keyboard.addKey(i);
    }

    // initiate the words to an empty string
    this.words = "";

    //declaring commands
    this.command_map = new Map();
    this.command_map.set("help", ["Brings up command list", true]);
    this.command_map.set("move left", ["Move your character to the left", true]);
    this.command_map.set("move right", ["Move your character to the right", true]);
    this.command_map.set("move forward", ["Advance your character forwards", true]);
    this.command_map.set("move backward", ["Retreat backwards", true]);
    this.command_map.set("turn around", ["Rotate your character 180", true]);
    this.command_map.set("attack left", ["attack to the left direction", true]);
    this.command_map.set("attack right", ["attack to the right direction", true]);
    this.command_map.set("attack forward", ["attack in front", true]);
    this.command_map.set("attack backward", ["attack behind you", true]);
    this.command_map.set("shop!", ["Transports you to a shop to upgrade your hero", true]);
    this.command_map.set("attack right with sword", ["attack to the right direction with a sword",false]);
    let comms: string[] = [""];
    this.command_map.forEach(function (value, key) {
      if (value[1]) {
        comms = [comms + "\n" + key + " : " + value[0]];
      }
    });
    this.commands = comms;

     // inititate the bitmaps to display
    this.wordLabel = this.add.bitmapText(10, 5, "pixelFont", "Command", 16);
    this.healthLabel = this.add.bitmapText(this.scale.width - 75, 5, "pixelFont", "health", 16);
    this.commandDisplay = this.add.bitmapText(10, 15, "pixelFont", "display", 16);
    this.commandDisplay.tint = 0x00000;
  }

  // the update function
  update() {
    // set the commandDisplay to default false
    this.commandDisplay.setVisible(false);

    // update the word label to display what the player has typed
    this.wordLabel.text = "Command:    " + this.words;

    // update the health label to display the character's current health
    this.healthLabel.text = "Health: " + this.player.get_health();

    // update the command display to hold all available commands
    this.commandDisplay.text = "Commands: " + this.commands;

    // check if the player is typing
    this.addLetters();    

    // check if the player entered a valid command
    if (this.player.movePlayer(this.words)) {
      // checks if the enemy is attacked by the command
      this.hit_enemy();
      // reset the player's entered words
      this.words = "";
    }

    // spawns a new enemy if there is none and the player types in the correct command
    if (this.words == "fight onward!" && !this.enemy_exists) {
      this.knight.x = 250;
      this.knight.y = 100;
      this.knight.setVisible(true);
      this.enemy_health = 100;
      this.enemy_exists = true;
      this.words = "";
    }

    // checks if the player wants to open the shop
    if (this.words == "shop!") {
      this.scene.start('ShopScene', { player: this.player, commands: this.command_map });
    }

    // if the player types in "help" then the available commands are displayed to the screen
    if (this.words == "help") {
      this.commandDisplay.setVisible(true);
    }

    // update enemy position
    this.moveEnemies();
  }

  // enemy position updating function. follows the players position
  moveEnemies() {
    if (this.knight.x < this.player.x - 25) {
      this.knight.x += .05;
      if (this.EnemyisFlipped) { this.knight.setFlipX(false); this.EnemyisFlipped = false; }
    } else if (this.knight.x > this.player.x + 25) {
      this.knight.x -= .05;
      if (!this.EnemyisFlipped) { this.knight.setFlipX(true); this.EnemyisFlipped = true; }

    }
    if (this.knight.y < this.player.y - 25) {
      this.knight.y += .05;
    } else if (this.knight.y > this.player.y + 25) {
      this.knight.y -= .05;
    }
  }

  // listens for player input and update accordingly
  addLetters() {
    let key_a: number = Phaser.Input.Keyboard.KeyCodes.A;
    let key_z: number = Phaser.Input.Keyboard.KeyCodes.Z;

    for (let i: number = key_a; i <= key_z; i++) {
      if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.keys[i])) {
        this.words += String.fromCharCode(i + 32);
        return;
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.SPACE])) {
      this.words += " ";
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.BACKSPACE])) {
      this.words = "";
      return;
    }

    if (this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.SHIFT].isDown &&
      Phaser.Input.Keyboard.JustDown(this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.ONE])) {
      this.words += "!";
      return;
    }
  }

  // checks if the enemy is damaged and killed by the attacks
  hit_enemy() {
    if ((this.words == "attack right") && (this.knight.x > this.player.x) && (this.knight.x < this.player.x + 50) &&
      (this.knight.y < this.player.y + 25) && (this.knight.y > this.player.y - 25)) {
      this.enemy_health -= 10;
    } else if ((this.words == "attack left") && (this.knight.x < this.player.x) && (this.knight.x > this.player.x - 50) &&
      (this.knight.y < this.player.y + 25) && (this.knight.y > this.player.y - 25)) {
      this.enemy_health -= 10;
    } else if ((this.words == "attack forward") && (this.knight.y < this.player.y) && (this.knight.y > this.player.y - 50) &&
      (this.knight.x < this.player.x + 25) && (this.knight.x > this.player.x - 25)) {
      this.enemy_health -= 10;
    } else if ((this.words == "attack backward") && (this.knight.y > this.player.y) && (this.knight.y < this.player.y + 50) &&
      (this.knight.x < this.player.x + 25) && (this.knight.x > this.player.x - 25)) {
      this.enemy_health -= 10;
    }

    if (this.enemy_health <= 0) {
      this.knight.setVisible(false);
      this.knight.x = -50;
      this.knight.y = -50;
      this.enemy_exists = false;
    }
  }
}