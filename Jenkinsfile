pipeline {
    agent { label 'SlaveNode' }

    environment {
        DOCKER_HOST        = 'unix:///var/run/docker.sock'
        DB_USER            = 'postgres'
        DB_PASSWORD        = 'postgres'
        DB_NAME            = 'healthify'
        API_PORT           = '5000'
        FRONTEND_PORT      = '5173'
        REGISTRY           = "192.168.50.4:5000"
        VERSION            = "${BUILD_NUMBER}"
        SONAR_SCANNER_OPTS = "-Xmx1024m"
        SWARM_MANAGER_IP   = "192.168.50.5"
        ANSIBLE_DIR        = "JenkinsAutomation/Prod"
        SSH_KEY            = "~/.ssh/id_rsa"
        HOST_IP            = "192.168.50.3"
    }

    stages {
        stage('Prepare Workspace') {
            steps {
                echo "Cleaning workspace"
                deleteDir()
                echo "Cloning repository"
                sh 'git clone https://github.com/SarjakBhandari/JenkinsAutomation'
            }
        }

        stage('Inject Environment Variables') {
            steps {
                script {
                    def apiBaseUrl = "http://${HOST_IP}:${API_PORT}/api"
                    echo "Setting DB_HOST=healthify_db and API_BASE_URL=${apiBaseUrl}"

                    writeFile file: 'JenkinsAutomation/app/backend/.env', text: """
DB_HOST=healthify_db
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
PORT=${API_PORT}
"""

                    writeFile file: 'JenkinsAutomation/app/frontend/src/config.js',
                              text: "export const API_BASE_URL = '${apiBaseUrl}';\n"
                }
            }
        }

        stage('Build and Deploy Staging') {
            steps {
                dir('JenkinsAutomation') {
                    echo "Building and deploying fullstack app (staging)"
                    sh '''
                        docker-compose down -v || true
                        docker-compose up -d --build
                        docker-compose ps
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    withCredentials([string(credentialsId: 'sonar-token-id', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            /opt/sonar-scanner/bin/sonar-scanner \
                                -Dsonar.projectKey=healthify \
                                -Dsonar.sources=JenkinsAutomation/app/backend/src/models/ \
                                -Dsonar.host.url=http://192.168.50.4:9000 \
                                -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Preview and Approval') {
            steps {
                script {
                    def previewUrl = "http://${HOST_IP}:${FRONTEND_PORT}"
                    echo "Preview your site at: ${previewUrl}"
                }
                timeout(time: 1, unit: 'DAYS') {
                    input message: 'Approve production deployment when ready.'
                }
                echo "Production deployment approved"
            }
        }

        stage('Push to Local Registry') {
            steps {
                script {
                    def frontendImage = "${REGISTRY}/healthify-frontend:${VERSION}"
                    def backendImage  = "${REGISTRY}/healthify-backend:${VERSION}"

                    sh """
                        docker tag healthify_frontend ${frontendImage}
                        docker push ${frontendImage}
                        docker tag healthify_backend ${backendImage}
                        docker push ${backendImage}
                    """
                }
            }
        }

        stage('Deploy to Swarm via Ansible') {
            agent { label 'ProductionEnv' }
            steps {
                script {
                    def registryIpOnly = REGISTRY.split(':')[0]
                    dir("${ANSIBLE_DIR}") {
                        echo "Running Ansible playbook for Swarm deployment"
                        sh """
                            ansible-playbook playbook.yml \
                                --extra-vars "registry_ip=${registryIpOnly} version=${VERSION}" \
                                -u jenkins \
                                --private-key ${SSH_KEY}
                        """
                    }
                }
            }
        }

        stage('Confirm Ansible Deployment') {
            steps {
                echo """
========================================================
ANSIBLE SWARM DEPLOYMENT SUCCESSFUL
Frontend: http://${SWARM_MANAGER_IP}:5173
Backend : http://${SWARM_MANAGER_IP}:5000
========================================================
"""
            }
        }

        stage('Deploy Monitoring via Ansible') {
            agent { label 'ProductionEnv' }
            steps {
                dir("${ANSIBLE_DIR}") {
                    echo "Deploying Prometheus & Grafana monitoring"
                    sh """
                        ansible-playbook monitoring.yml \
                            -u jenkins \
                            --private-key ${SSH_KEY}
                    """
                }
            }
        }

        stage('Confirm Monitoring & Print URLs') {
            steps {
                echo """
========================================================
Monitoring deployed on ProductionEnv
Prometheus: http://${SWARM_MANAGER_IP}:9090
Grafana   : http://${SWARM_MANAGER_IP}:3000
Grafana credentials: admin/admin123
========================================================
"""
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: '**/Dockerfile, **/*.env, **/config.js, ansible/files/*.yml', fingerprint: true
            }
        }
    }

    post {
        success {
            mail to: 'sarjakytdfiles@gmail.com',
                 subject: 'BUILD SUCCESS',
                 body: """Build #${BUILD_NUMBER} succeeded.
App: http://${SWARM_MANAGER_IP}:5173
API: http://${SWARM_MANAGER_IP}:5000
Prometheus: http://${SWARM_MANAGER_IP}:9090
Grafana: http://${SWARM_MANAGER_IP}:3000 (admin/admin123)
${BUILD_URL}"""
        }
        failure {
            mail to: 'sarjakytdfiles@gmail.com',
                 subject: 'BUILD FAILURE',
                 body: "Build #${BUILD_NUMBER} failed. Check logs: ${BUILD_URL}"
        }
    }
}
