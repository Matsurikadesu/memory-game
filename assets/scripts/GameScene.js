class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    preload(){
        this.load.image('bg', './assets/sprites/background.jpg');
        this.load.image('card', './assets/sprites/card.png');
        this.load.image('card1', './assets/sprites/card1.png');
        this.load.image('card2', './assets/sprites/card2.png');
        this.load.image('card3', './assets/sprites/card3.png');
        this.load.image('card4', './assets/sprites/card4.png');
        this.load.image('card5', './assets/sprites/card5.png');

        this.load.audio('card', './assets/sounds/card.mp3');
        this.load.audio('complete', './assets/sounds/complete.mp3');
        this.load.audio('success', './assets/sounds/success.mp3');
        this.load.audio('theme', './assets/sounds/theme.mp3');
        this.load.audio('timeout', './assets/sounds/timeout.mp3');
    }

    createText() {
        this.timeoutText = this.add.text(10, 330, "", {
            font: '28px Arial',
            fill: 'white'
        })
    }

    onTimerTick() {
        this.timeoutText.setText("Time: " + this.timeout);
        if(this.timeout <= 0) {
            this.timer.paused = true;
            this.sounds.timeout.play({
                volume: .3
            });
            this.restart();
        } else{
            --this.timeout;
        }
    }

    createTimer() {
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.onTimerTick,
            callbackScope: this,
            loop: true
        })
    }

    createSounds() {
        this.sounds = {
            card: this.sound.add('card'),
            success: this.sound.add('success'),
            complete: this.sound.add('complete'),
            theme: this.sound.add('theme'),
            timeout: this.sound.add('timeout')
        }

        this.sounds.theme.play({
            volume: 0.05
        });
    }

    create() {
        this.timeout = config.timeout;
        this.createSounds();
        this.createBackground();
        this.createText();
        this.createCards();
        this.createTimer();
        this.start();
    }
    restart() {
        let count = 0;
        let onCardMoveComplete = () => {
            ++count;
            if(count === this.cards.length) {
                this.start();
            }
        };
        this.cards.forEach(card => {
            card.move({
                x: this.sys.game.config.width + card.width,
                y: this.sys.game.config.height + card.height,
                delay: card.position.delay,
                callback: onCardMoveComplete
            })
        });
    }

    start() {
        this.initCardPositions();
        this.timeout = config.timeout;
        this.openedCard = null;
        this.openedCardCount = 0;
        this.timer.paused = false;
        this.initCards();
        this.showCards()
    }
    
    initCards() {
        let positions = Phaser.Utils.Array.Shuffle(this.positions);

        this.cards.forEach(card => {
            card.init(positions.pop());
        })
    }

    showCards() {
        this.cards.forEach(card => {
            card.depth = card.position.delay;
            card.move({
                x: card.position.x,
                y: card.position.y,
                delay: card.position.delay
            })
        })
    }

    createBackground() {
        this.add.sprite(0, 0, 'bg').setOrigin(0, 0);
    }

    createCards() {
        this.cards = [];

        for(let value of config.cards) {
            for(let i = 1; i <= 2; i++){
                this.cards.push(new Card(this, value))
            }
        }

        this.input.on("gameobjectdown", this.onCardClicked, this);
    }

    onCardClicked(pointer, card) {
        if (card.opened) return false;

        if (this.openedCard) {
            if(this.openedCard.value === card.value){
                this.sounds.success.play({
                    volume: .3
                });
                this.openedCard = null;
                ++this.openedCardCount;
            } else {
                this.openedCard.close();
                this.openedCard = card;
                this.sounds.card.play({
                    volume: .3
                });
            }
        } else {
            this.sounds.card.play({
                volume: .3
            });
            this.openedCard = card;
        }

        card.open(() => {
            if(this.openedCardCount === this.cards.length / 2){
                this.sounds.complete.play({
                    volume: .3
                });
                this.restart();
            }
        });
    }

    initCardPositions() {
        let positions = [];
        let cardTexture = this.textures.get('card').getSourceImage();
        let cardWidth = cardTexture.width + 8;
        let cardHeight = cardTexture.height + 8;
        let offsetX = (this.sys.game.config.width - cardWidth * config.cols) / 2 + cardWidth / 2;
        let offsetY = (this.sys.game.config.height - cardHeight * config.rows) / 2 + cardHeight / 2;
        let id = 0;
        for (let row = 0; row < config.rows; row++){
            for (let col = 0; col < config.cols; col++){
                positions.push({
                    delay: ++id * 100, 
                    x: offsetX + col * cardWidth,
                    y: offsetY + row * cardHeight,
                })
            }
        }

        this.positions = positions;;
    }
}