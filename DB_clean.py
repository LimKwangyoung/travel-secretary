import MySQLdb
from dotenv import load_dotenv
import os

load_dotenv()  # .env 파일 로드

# 데이터베이스 연결
db = MySQLdb.connect(host=os.getenv('DB_HOST'), user=os.getenv('DB_USER'), passwd=os.getenv('DB_PASSWORD'), db=os.getenv('DB_NAME'))

cursor = db.cursor()

# 외래 키 제약 해제
cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")

# 테이블 목록을 가져오기
cursor.execute("SHOW TABLES;")
tables = cursor.fetchall()

# 각 테이블에 대해 TRUNCATE 실행
for table in tables:
    cursor.execute(f"TRUNCATE TABLE {table[0]};")

# 외래 키 제약 다시 활성화
cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

# 변경사항 커밋 및 연결 종료
db.commit()
db.close()