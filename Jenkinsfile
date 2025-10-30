pipeline {
    agent { label 'SlaveNode' }

    stages {
        stage('Prepare Workspace') {
            steps {
                deleteDir()
                sh 'git clone https://github.com/SarjakBhandari/JenkinsAutomation'
            }
        }

        stage('Load Environment') {
            steps {
                dir('JenkinsAutomation') {
                    script {
                        def envMap = readProperties file: '.env'
                        envMap.each { key, value -> env[key] = value }
                    }
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
                                -Dsonar.sources=JenkinsAutomation/app/backend/ \
                                -Dsonar.host.url=http://192.168.50.3:9000 \
                                -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Pipeline aborted due to Quality Gate failure."
                        }
                    }
                }
            }
        }

        stage('Build and Deploy Staging') {
            steps {
                dir('JenkinsAutomation') {
                    sh '''
                        docker-compose --env-file .env down --remove-orphans --volumes || true
                        docker-compose --env-file .env build --build-arg TAG=${IMAGE_TAG}
                        docker tag ${IMAGE_NAME_FE}:${IMAGE_TAG} ${IMAGE_NAME_FE}:latest
                        docker tag ${IMAGE_NAME_BE}:${IMAGE_TAG} ${IMAGE_NAME_BE}:latest
                        docker-compose --env-file .env up -d --force-recreate
                    '''
                }
            }
        }

        stage('Preview and Approval') {
            steps {
                script {
                    echo "Preview your app at: http://${HOST_IP}:${FRONTEND_PORT}"
                }
                timeout(time: 1, unit: 'DAYS') {
                    input message: 'Approve production deployment when ready.'
                }
            }
        }

        stage('Build and Push Images') {
            steps {
                dir('JenkinsAutomation') {
                    sh '''
                        docker tag ${IMAGE_NAME_FE}:latest ${REGISTRY}/${IMAGE_NAME_FE}:latest
                        docker tag ${IMAGE_NAME_BE}:latest ${REGISTRY}/${IMAGE_NAME_BE}:latest
                        docker push ${REGISTRY}/${IMAGE_NAME_FE}:latest
                        docker push ${REGISTRY}/${IMAGE_NAME_BE}:latest
                    '''
                }
            }
        }

        stage('Pull & Scan from Registry') {
            steps {
                sh '''
                    set -e

                    docker pull ${REGISTRY}/${IMAGE_NAME_FE}:latest
                    trivy image --scanners vuln --severity HIGH,CRITICAL ${REGISTRY}/${IMAGE_NAME_FE}:latest || {
                        DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' ${REGISTRY}/${IMAGE_NAME_FE}:latest | cut -d'@' -f2)
                        curl -sf -X DELETE "http://${REGISTRY}/v2/${IMAGE_NAME_FE}/manifests/${DIGEST}" || echo "Delete unsupported"
                        exit 1
                    }

                    docker pull ${REGISTRY}/${IMAGE_NAME_BE}:latest
                    trivy image --scanners vuln --skip-dirs usr/src/app/node_modules --severity HIGH,CRITICAL ${REGISTRY}/${IMAGE_NAME_BE}:latest || {
                        DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' ${REGISTRY}/${IMAGE_NAME_BE}:latest | cut -d'@' -f2)
                        curl -sf -X DELETE "http://${REGISTRY}/v2/${IMAGE_NAME_BE}/manifests/${DIGEST}" || echo "Delete unsupported"
                        exit 1
                    }

                    echo "Both images passed scan"
                '''
            }
        }
    }

    post {
        success {
            mail to: 'sarjakytdfiles@gmail.com',
                 subject: 'BUILD SUCCESS',
                 body: """Build #${BUILD_NUMBER} succeeded.
                        App: http://192.168.50.3:${FRONTEND_PORT}
                        API: http://192.168.50.3:${BACKEND_PORT}
${BUILD_URL}"""
        }
        failure {
            mail to: 'sarjakytdfiles@gmail.com',
                 subject: 'BUILD FAILURE',
                 body: "Build #${BUILD_NUMBER} failed. Check logs: ${BUILD_URL}"
        }
    }
}
