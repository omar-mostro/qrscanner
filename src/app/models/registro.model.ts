export class Registro {

    public format: string;
    public text: string;
    public tipe: string;
    public icon: string;
    public created: Date;

    constructor(format: string, text: string) {
        this.format = format;
        this.text = text;
        this.created = new Date();

        this.determinarTipo();
    }

    private determinarTipo() {

        const inicioTexto = this.text.substring(0, 4);

        switch (inicioTexto) {
            case 'http':
                this.tipe = 'http';
                this.icon = 'globe';
                break;

            case 'geo:':
                this.tipe = 'geo';
                this.icon = 'pin';
                break;

            default:
                this.tipe = 'No reconocido';
                this.icon = 'create';
        }
    }
}
