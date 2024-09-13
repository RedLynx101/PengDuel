import { PENGUIN_RADIUS, ICEBERG_RADIUS, FRICTION, PUSH_FORCE } from './game.js';

export class Penguin {
    constructor(x, y, color, name, penguinSVG) {
        console.log(`Penguin constructor called for ${name}`);
        this.x = x;
        this.y = y;
        this.color = color;
        this.name = name;
        this.vx = 0;
        this.vy = 0;
        this.crowned = false;
        this.originalRadius = PENGUIN_RADIUS;
        this.originalMass = 1;
        this.currentRadius = this.originalRadius;
        this.mass = this.originalMass;
        this.originalAccelaration = 1.5;
        this.currentAcceleration = this.originalAccelaration;
        this.powerUpActive = false;
        this.powerUpType = null;
        this.powerUpEndTime = 0;
        this.svgImage = null;
        this.loadSVG(penguinSVG);
    }

    loadSVG(penguinSVG) {
        if (penguinSVG) {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(penguinSVG, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
            this.updateSVGColor(svgElement);
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const img = new Image();
            img.onload = () => {
                console.log(`SVG image loaded for ${this.name}`);
                this.svgImage = img;
            };
            img.onerror = (error) => {
                console.error(`Error loading SVG for ${this.name}:`, error);
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
        }
    }

    updateSVGColor(svgElement) {
        svgElement.querySelectorAll('circle, path').forEach(element => {
            if (element.getAttribute('fill') !== '#FFFFFF') {
                element.setAttribute('fill', this.color);
            }
        });
    }

    updateColor(newColor) {
        this.color = newColor;
        if (this.svgImage) {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(this.svgImage.src, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
            this.updateSVGColor(svgElement);
            const svgString = new XMLSerializer().serializeToString(svgElement);
            this.svgImage.src = 'data:image/svg+xml;base64,' + btoa(svgString);
        }
    }


activatePowerUp(type) {
    this.powerUpActive = true;
    this.powerUpType = type;
    this.powerUpEndTime = Date.now() + 10000; // 10 seconds
    if (type === 'speed') {
        // Increased speed boost
        this.currentAcceleration = this.originalAccelaration * 1.5;
        this.currentRadius = this.originalRadius / 2;
        this.mass = this.originalMass / 1.2;
    } else if (type === 'size') {
        this.currentRadius = this.originalRadius * 2.4;
        this.mass = this.originalMass * 2.4;
        this.currentAcceleration = this.originalAccelaration * 0.8;
    }
}
deactivatePowerUp() {
    if (this.powerUpType === 'speed') {
        this.currentAcceleration = this.originalAccelaration;
        this.currentRadius = this.originalRadius;
        this.mass = this.originalMass;
    } else if (this.powerUpType === 'size') {
        this.currentRadius = this.originalRadius;
        this.mass = this.originalMass;
        this.currentAcceleration = this.originalAccelaration;
    }
    this.powerUpActive = false;
    this.powerUpType = null;
}
setCrowned(crowned) {
    console.log(`Setting crowned status for ${this.name}: ${crowned}`);
    this.crowned = crowned;
}
removeCrown() {
    this.crowned = false;
}
}
