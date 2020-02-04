import {Injectable} from '@angular/core';
import {Registro} from '../models/registro.model';
import {Storage} from '@ionic/storage';
import {NavController} from '@ionic/angular';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {File} from '@ionic-native/file/ngx';
import {EmailComposer} from '@ionic-native/email-composer/ngx';
import {Platform} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class DataLocalService {

    guardados: Registro[] = [];
    path: string;

    constructor(private storage: Storage,
                private navController: NavController,
                private iab: InAppBrowser,
                private file: File,
                private emailComposer: EmailComposer,
                public platform: Platform
    ) {

        this.cargarStorage();
    }

    async cargarStorage() {
        this.guardados = (await this.storage.get('registros')) || [];
    }

    async guardarRegistro(format: string, text: string) {

        await this.cargarStorage();

        const nuevoRegistro = new Registro(format, text);

        this.guardados.unshift(nuevoRegistro);

        this.storage.set('registros', this.guardados);

        this.abrirRegistro(nuevoRegistro);

    }

    abrirRegistro(registro: Registro) {

        this.navController.navigateForward('tabs/tab2');

        switch (registro.tipe) {

            case 'http':
                this.iab.create(registro.text, '_system');
                break;

            case 'geo':
                this.navController.navigateForward(`/tabs/tab2/mapa/${registro.text}`);
                break;
        }
    }

    enviarCorreo() {

        console.log('enviar');
        const arrTemp = [];
        const titulos = 'Tipo, Formato, Creado en, Texto\n';

        arrTemp.push(titulos);

        this.guardados.forEach(registro => {
            const linea = `${registro.tipe}, ${registro.format}, ${registro.created}, ${registro.text.replace(',', ' ')}\n`;

            arrTemp.push(linea);
        });

        this.crearArchivoFisico(arrTemp.join(''));
    }

    crearArchivoFisico(text: string) {

        if (this.platform.is('android')) {
            this.path = this.file.externalDataDirectory;
        } else { // si estamos en ios
            this.path = this.file.dataDirectory;
        }

        this.file.checkFile(this.path, 'registros.csv')
            .then(existe => {
                console.log('Existe archivo?', existe);
                return this.escribirEnArchivo(text);
            })
            .catch(err => {

                return this.file.createFile(this.path, 'registros.csv', false)
                    .then(creado => this.escribirEnArchivo(text))
                    .catch(err2 => console.log('No se pudo crear el archivo', err2));

            });

    }

    async escribirEnArchivo(text: string) {

        await this.file.writeExistingFile(this.path, 'registros.csv', text);

        const archivo = `${this.path}/registros.csv`;
        // console.log(this.file.dataDirectory + 'registros.csv');

        const email = {
            to: 'fernando.herrera85@gmail.com',
            // cc: 'erika@mustermann.de',
            // bcc: ['john@doe.com', 'jane@doe.com'],
            attachments: [
                archivo
            ],
            subject: 'Backup de scans',
            body: 'Aquí tienen sus backups de los scans - <strong>ScanApp</strong>',
            isHtml: true
        };

        // Send a text message using default options
        this.emailComposer.open(email);
    }
}
