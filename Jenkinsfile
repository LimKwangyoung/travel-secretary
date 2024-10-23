pipeline {
    agent any

    environment {
        BACKEND_IMAGE = 'parenhark/backend'
        ENV_FILE_PATH = '/home/ubuntu/.env'
    }

    stages {
        stage('Clone Backend Repo') {
            steps {
                git branch: 'back', credentialsId: 'e92707da-8291-494e-bfdd-b2a93870460a', url: 'https://lab.ssafy.com/s11-fintech-finance-sub1/S11P21A204.git'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                script {
                    // 백엔드만 빌드
                    sh 'docker-compose --env-file /home/ubuntu/.env build backend'
                    sh 'docker tag backend_image:latest $BACKEND_IMAGE:$BUILD_NUMBER'  // 빌드된 이미지에 태그 추가
                }
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                script {
                    withDockerRegistry([credentialsId: 'c23281eb-4db4-4090-973c-80cacc65904d', url: 'https://index.docker.io/v1/']) {
                        sh 'docker push $BACKEND_IMAGE:$BUILD_NUMBER'
                    }
                }
            }
        }

        stage('Restart Backend Only') {
            steps {
                script {
                    // 백엔드만 중지 후 다시 시작
                    sh '''
                    docker-compose stop backend &&
                    docker-compose up -d backend
                    '''
                }
            }
        }

        stage('Connect Server') {
            steps {
                script {
                    sh 'docker network inspect app-network'
                    sh 'docker network connect app-network back-backend-1'
                }
            }
        }
    }
}
