import {Construct} from 'constructs';
import {App, Chart} from 'cdk8s';
import {Deployment, IntOrString, PersistentVolumeClaim, Service} from './imports/k8s'

export class MariaDbChart extends Chart {

    constructor(scope: Construct, name: string) {
        super(scope, name);
        const label = {app: 'mariadb'};

        new PersistentVolumeClaim(this, 'pvc', {
            metadata: {
                name: 'mariadb'
            },
            spec: {
                storageClassName: 'default',
                accessModes: ['ReadWriteOnce'],
                resources: {
                    requests: {
                        storage: '250Mi'
                    }
                }
            }
        });

        new Service(this, 'service', {
            spec: {
                ports: [{port: 3306, targetPort: IntOrString.fromNumber(3306)}],
                selector: label
            }
        });

        new Deployment(this, 'deployment', {
            spec: {
                replicas: 1,
                selector: {
                    matchLabels: label
                },
                template: {
                    metadata: {labels: label},
                    spec: {
                        volumes: [
                            {
                                name: 'mariadb',
                                persistentVolumeClaim: {claimName: 'mariadb'}
                            }],
                        containers: [{
                            name: 'mariadb',
                            image: 'mariadb',

                            ports: [{containerPort: 3306}],
                            env: [
                                {name: 'MYSQL_DATABASE', value: 'mariadb'},
                                {name: 'MYSQL_ROOT_PASSWORD', value: 'password'},
                                {name: 'MYSQL_USER', value: 'mariadb'},
                                {name: 'MYSQL_PASSWORD', value: 'mariadb'}
                            ],
                            volumeMounts: [{mountPath: '/var/lib/mysql', name: 'mariadb'}]
                        }]
                    }
                }
            }
        });
    }
}

const app = new App();
new MariaDbChart(app, 'mariadb');
app.synth();
