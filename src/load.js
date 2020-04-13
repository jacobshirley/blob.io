
class Load extends Phaser.Scene{
    constructor()
    {
        super({key: "Load"});
    }

    preload()
    {
        //load assets
        //player
        this.load.spritesheet("player_idle", "../assets/v1.1 dungeon crawler 16x16 pixel pack/heroes/knight/knight_idle_spritesheet.png", {
            frameHeight: 16,
            frameWidth: 16
        });
        this.load.spritesheet("player_run", "../assets/v1.1 dungeon crawler 16x16 pixel pack/heroes/knight/knight_run_spritesheet.png", {
            frameHeight: 16,
            frameWidth: 16
        });
        //slime
        this.load.spritesheet("slime_idle", "../assets/v1.1 dungeon crawler 16x16 pixel pack/enemies/slime/slime_idle_spritesheet.png", {
            frameHeight: 16,
            frameWidth: 16
        });
        this.load.spritesheet("slime_run", "../assets/v1.1 dungeon crawler 16x16 pixel pack/enemies/slime/slime_run_spritesheet.png", {
            frameHeight: 16,
            frameWidth: 16
        });
        //goblin
        this.load.spritesheet("goblin_idle", "../assets/v1.1 dungeon crawler 16x16 pixel pack/enemies/goblin/goblin_idle_spritesheet.png", {
            frameHeight: 16,
            frameWidth: 16
        });
        this.load.spritesheet("goblin_run", "../assets/v1.1 dungeon crawler 16x16 pixel pack/enemies/goblin/goblin_run_spritesheet.png", {
            frameHeight: 16,
            frameWidth: 16
        });
        //flying creature
        this.load.spritesheet("fly_idle", "../assets/v1.1 dungeon crawler 16x16 pixel pack/enemies/flying creature/fly_anim_spritesheet.png", {
            frameHeight: 16,
            frameWidth: 16
        });

        //Audio
        this.load.audio("title_music", "../assets/music/Monplaisir_-_11_-_66666666666666666666_66666666666666666666_66666666666666666666_66666666666666666666_66666666666666666666_66666666666666666666.mp3");

        //ui
        this.load.image("menu_btn", "../assets/v1.1 dungeon crawler 16x16 pixel pack/ui (new)/menu_button.png");
        this.load.image("sound_playing", "../assets/ui/sound_playing.png");
        this.load.image("sound_mute", "../assets/ui/sound_mute.png");

        //words
        this.load.text("dict", "../assets/words/words_alpha.txt");

        //tilemaps
        this.load.image("floor", "../assets/tilemaps/room1.png");
        this.load.image('floortiles', '../assets/v1.1 dungeon crawler 16x16 pixel pack/tiles/floor/floor_spritesheet.png');
        this.load.tilemapTiledJSON("map1", "../assets/tilemaps/room1.json");

        //loading bar 
        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff
            }
        });

        this.load.on("progress", (percent) => {
            loadingBar.fillRect(0, this.game.renderer.height / 2, this.game.renderer.width * percent, 50);
        });
    }

    create()
    {
        this.scene.start("Menu");
    }

    update()
    {
        
    }
}