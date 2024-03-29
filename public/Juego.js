class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'Main'
        })
    }
    preload() {
        this.load.image('buttonBG', 'assets/tilsets/button-bg.png');
        this.load.image('buttonText', 'assets/tilsets/button-text.png');
        this.load.audio('logim', ['assets/music/logim.mp3']);
    }
    create() {
      var login = this.sound.add('logim',true);
        //login.play();
        var bg = this.add.image(0, 0, 'buttonBG');
        var text = this.add.image(0, 0, 'buttonText');
        var container = this.add.container(512, 256, [bg, text]);
        bg.setInteractive();
        bg.once('pointerup', function() {
          login.stop();
            this.scene.start('game');
        }, this);
    }
}
let controls;
var player;
var bombas;
let bombCD = false;
class Game extends Phaser.Scene {
    constructor() {
        super({
            key: 'game'
        })
        console.log('SubScene: constructor');
    }
    preload() {
        this.load.audio('principal', ['assets/music/principal.mp3']);
        this.load.image("tilesetNameInPhaser", "assets/tilsets/cajas.png");
        this.load.tilemapTiledJSON("level1", "assets/tilemaps/bombmap.json");
        this.load.spritesheet("alien", "assets/atlas/alien2.png", {
            frameWidth: 30,
            frameHeight: 30
        });
        this.load.spritesheet("bomb", "assets/atlas/bomba.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet("explosion", "assets/atlas/explosion.png", {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
      //música del juego
        var musica = this.sound.add('principal',true);
        //musica.play();
        //creaando el grupo de bombas
         bombas = this.physics.add.staticGroup();
        this.socket = io();
        let self = this;
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        //control de usuarios
        this.socket.on('Jugadores_conectados', function(jugadores) {
            if (jugadores.length > 4) {
                alert("Partida llena");
                self.scene.start('Main');
            }
        });
        // Creación de las propiedades gráficas de Juego
        const map = this.make.tilemap({
            key: "level1"
        });
        const tileset = map.addTilesetImage("cajas", "tilesetNameInPhaser");
        const objetos = map.createStaticLayer("objetos", tileset, 0, 0);
        const relleno = map.createStaticLayer("relleno", tileset, 0, 0);
        const piso = map.createStaticLayer("piso", tileset, 0, 0);
        objetos.setCollisionByProperty({
            collides: true
        });
        relleno.setCollisionByProperty({
            collides: true
        });
        objetos.setDepth(10);
        relleno.setDepth(10);
        var spawnpoint = new Array();
        spawnpoint[0] = map.findObject("SpawnPoint", obj => obj.name === "SpawnPoint");
        spawnpoint[1] = map.findObject("SpawnPoint", obj => obj.name === "SpawnPoint2");
        spawnpoint[2] = map.findObject("SpawnPoint", obj => obj.name === "SpawnPoint3");
        spawnpoint[3] = map.findObject("SpawnPoint", obj => obj.name === "SpawnPoint4");
        player = this.physics.add.sprite(spawnpoint.x, spawnpoint.y, "alien");
        this.physics.add.collider(player, objetos);
        this.physics.add.collider(player, relleno);
        let bomb = this.physics.add.image(player.x, player.y, 'bomb');
        //self.physics.add.overlap(player,bomb,this.bombacollide,null,self);

        //Establecimiento de la conexión con otros jugadores
        this.otrosjugadores = new Array();
        this.socket.on('Jugadores_conectados', function(jugadores) {
            for (var i = 0; i < jugadores.length; i++) {
                if (jugadores[i].playerId === self.socket.id) {
                    jugadores[i].x = spawnpoint[i].x;
                    jugadores[i].y = spawnpoint[i].y;
                    player.x = jugadores[i].x;
                    player.y = jugadores[i].y;
                } else {
                    jugadores[i].x = spawnpoint[i].x;
                    jugadores[i].y = spawnpoint[i].y;
                    let otro = self.physics.add.sprite(jugadores[i].x, jugadores[i].y, "alien");
                    self.physics.add.collider(otro, objetos);
                    self.physics.add.collider(otro, relleno);
                    otro.playerId = jugadores[i].playerId;
                    self.otrosjugadores.push(otro);
                }
            }
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('alien', {
                start: 0,
                end: 3
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [{
                key: 'alien',
                frame: 1
            }],
            frameRate: 20
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('alien', {
                start: 0,
                end: 3
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('alien', {
                frame: 4
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('alien', {
                frame: 4
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'bomba',
            frames: this.anims.generateFrameNumbers('bomb', {
                start: 0,
                end: 3
            }),
            frameRate: 3,
            repeat: -1
        });
        this.anims.create({
            key: 'boom',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 5
            }),
            frameRate: 3,
            repeat: -1
        });



        this.cursors = this.input.keyboard.createCursorKeys();
        // Debug graphics
        this.input.keyboard.once("keydown_D", event => {
            this.physics.world.createDebugGraphic();
            const graphics = this.add.graphics().setAlpha(0.75).setDepth(20);
            worldLayer.renderDebug(graphics, {
                tileColor: null,
                collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
                faceColor: new Phaser.Display.Color(40, 39, 37, 255)
            });
        });

        //Métodos de conexión con el servidor
        this.socket.on('nuevojugador', function(jugador) {
            const avatar = self.add.sprite(jugador.x, jugador.y, "alien");;
            avatar.playerId = jugador.playerId;
            self.otrosjugadores.push(avatar);
            console.log(self.otrosjugadores);
        });
        this.socket.on('jugador_movido', function(jugador) {
            for (var i = 0; i < self.otrosjugadores.length; i++) {
                if (self.otrosjugadores[i].playerId === jugador.playerId) {
                    self.otrosjugadores[i].x = jugador.x;
                    self.otrosjugadores[i].y = jugador.y;
                }
            }
        })
        this.socket.on('disconnect', function(usuario_desconectado) {
            for (var i = 0; i < self.otrosjugadores.length; i++) {
                if (self.otrosjugadores[i].playerId === usuario_desconectado) {
                    self.otrosjugadores[i].destroy();
                    delete self.otrosjugadores[i];
                    self.otrosjugadores.splice(i, 1);
                }
            }
            console.log(self.otrosjugadores);
        });
    }
    update() {
        // Efectos de la animación
        this.mover(this);
        //Emitir movimientos
        this.emitir_movimeintos(this);
        let bombita;
        if (this.spacebar.isDown) {
            if (!bombCD) {
                bombita=bombas.create(player.x,player.y,"bomb");
                bombita.anims.play("bomba");
                let timer = this.time.delayedCall(2000, this.cooldownBomb, [bombita], this);
                this.physics.add.collider(player,bombita);
                bombCD=true;
            }
        }
    }
      cooldownBomb(bombita){
        bombita.destroy();
        bombCD = false;
        let caboom = this.physics.add.sprite(bombita.x, bombita.y, 'explosion');
        caboom.anims.play('boom');
        let timer = this.time.delayedCall(1000, this.endboom, [caboom], this);
      }

      endboom(catabum){
        catabum.destroy();
      }


    mover() {
        this.input.keyboard.on('keydown_SPACE', () => {

        });
        player.body.setVelocity(0);
        if (this.cursors.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
        } else if (this.cursors.up.isDown) {
            player.setVelocityY(-160);
            player.anims.play("up", true);
        } else if (this.cursors.down.isDown) {
            player.setVelocityY(160);
            player.anims.play("down", true);
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }
        if (this.cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
        }
    }
    emitir_movimeintos(self) {
        var x = player.x;
        var y = player.y;
        if (player.oldPosition && (x !== player.oldPosition.x || y !== player.oldPosition.y)) {
            self.socket.emit('MovimientoDeJugador', {
                x: player.x,
                y: player.y,
            });
        }
        // save old position data
        player.oldPosition = {
            x: player.x,
            y: player.y,
        };
    }
}
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 512,
    parent: "game-container",
    pixelArt: true,
    physics: {
        default: "arcade",
    },
    scene: [MainScene, Game]
};
const game = new Phaser.Game(config);
