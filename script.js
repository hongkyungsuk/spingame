// 원판에 표시될 항목 목록을 배열로 정의
const prizes = [
  '먄두한판', // 0번 섹터
  '10% 할인', // 1번 섹터
  '칼국수 1인분', // 2번 섹터
  '음료수 한잔', // 3번 섹터
  '무료 커피', // 4번 섹터
  '꽝, 한번더!' // 5번 섹터
];

// 원판 섹터 개수 (항목 수와 동일)
const numSectors = prizes.length;
// 각 섹터의 각도 (360도 / 섹터 수)
const sectorAngle = 360 / numSectors;

// 캔버스 요소와 컨텍스트 가져오기
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

// 결과 표시 영역과 버튼, 폭죽 컨테이너 가져오기
const resultDiv = document.getElementById('result');
const spinBtn = document.getElementById('spinBtn');
const confettiDiv = document.getElementById('confetti');

// 원판 반지름 계산 (캔버스 크기의 40%로 설정)
const radius = canvas.width * 0.4;
// 원판 중심 좌표 계산
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// 섹터별 색상 배열 (가시성 높고 세련된 색상 6개)
const sectorColors = [
  '#fbbf24', // 노랑
  '#38bdf8', // 파랑
  '#34d399', // 초록
  '#f472b6', // 핑크
  '#a78bfa', // 보라
  '#f87171'  // 빨강
];

// 현재 원판의 회전 각도 (도 단위)
let currentAngle = 0;
// 애니메이션 프레임 ID 저장용
let animationId = null;
// 회전 중 여부 플래그
let isSpinning = false;

// 넥슨고딕체가 적용된 원판을 그리는 함수
function drawWheel(angle = 0) {
  // 캔버스 전체 지우기
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 각 섹터를 순회하며 그리기
  for (let i = 0; i < numSectors; i++) {
    // 시작 각도와 끝 각도 계산 (라디안 단위)
    const startAngle = ((sectorAngle * i + angle) * Math.PI) / 180;
    const endAngle = ((sectorAngle * (i + 1) + angle) * Math.PI) / 180;
    // 섹터 색상 설정
    ctx.fillStyle = sectorColors[i % sectorColors.length];
    // 섹터 그리기
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    // 섹터 경계선 그리기
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.stroke();
    // 섹터 안에 텍스트 그리기
    ctx.save();
    // 텍스트 각도 중앙으로 이동
    ctx.translate(centerX, centerY);
    ctx.rotate(((sectorAngle * (i + 0.5) + angle) * Math.PI) / 180);
    // 방사형으로 세우기 위해 90도(PI/2) 추가 회전
    ctx.rotate(Math.PI / 2);
    // 텍스트 스타일 설정 (넥슨고딕, 굵게, 가시성 높게)
    ctx.font = 'bold 1.2rem "NEXON Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#222';
    // 텍스트 그림자 효과로 가시성 향상
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 6;
    // 텍스트 위치 (반지름 70% 지점, y축 방향으로 바깥쪽)
    ctx.fillText(prizes[i], 0, -radius * 0.7);
    ctx.restore();
  }
  // 원판 중앙에 원 그리기 (디자인용)
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#e0e7ef';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;
  // 중앙 텍스트 (행운의 룰렛)
  ctx.font = 'bold 1.1rem "NEXON Gothic", sans-serif';
  ctx.fillStyle = '#e11d48';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('행운의 룰렛', centerX, centerY);
  // 포인터(삼각형) 그리기 (원판 위쪽)
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius - 18);
  ctx.lineTo(centerX - 18, centerY - radius - 44);
  ctx.lineTo(centerX + 18, centerY - radius - 44);
  ctx.closePath();
  ctx.fillStyle = '#e11d48';
  ctx.shadowColor = '#e11d48';
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.shadowBlur = 0;
}

// 최초 1회 원판 그리기
drawWheel();

// 룰렛 회전 애니메이션 함수
function spinWheel() {
  // 이미 회전 중이면 무시
  if (isSpinning) return;
  // 회전 중 플래그 설정
  isSpinning = true;
  // 결과 영역 초기화
  resultDiv.textContent = '';
  // 폭죽 효과 제거
  confettiDiv.innerHTML = '';
  // 회전할 최종 각도(랜덤) 계산 (5바퀴 + 랜덤 섹터 중앙)
  const randomSector = Math.floor(Math.random() * numSectors);
  // 섹터 중앙에 멈추도록 각도 계산
  const stopAngle = 360 * 5 + (sectorAngle * randomSector) + sectorAngle / 2;
  // 회전 시작 각도
  const startAngle = currentAngle;
  // 회전 시간(ms)
  const duration = 5000;
  // 시작 시간 기록
  const startTime = performance.now();

  // 애니메이션 프레임 함수 정의
  function animate(now) {
    // 경과 시간 계산
    const elapsed = now - startTime;
    // 진행률(0~1)
    const progress = Math.min(elapsed / duration, 1);
    // easeOutCubic 가속도 적용
    const ease = 1 - Math.pow(1 - progress, 3);
    // 현재 각도 계산
    currentAngle = startAngle + (stopAngle - startAngle) * ease;
    // 원판 그리기
    drawWheel(currentAngle);
    // 진행 중이면 다음 프레임 요청
    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      // 회전 종료
      isSpinning = false;
      // 최종 각도를 0~360 범위로 정규화
      currentAngle = currentAngle % 360;
      // 당첨 섹터 계산 (포인터가 가리키는 섹터)
      const landed = Math.floor(((360 - (currentAngle - sectorAngle / 2)) % 360) / sectorAngle);
      // 결과 표시
      showResult(landed);
      // 폭죽 효과 실행
      launchConfetti();
    }
  }
  // 애니메이션 시작
  animationId = requestAnimationFrame(animate);
}

// 결과 표시 함수
function showResult(index) {
  // 당첨된 항목을 큰 글씨로 표시
  resultDiv.textContent = `🎉 ${prizes[index]} 🎉`;
}

// 버튼 클릭 이벤트에 spinWheel 함수 연결
spinBtn.addEventListener('click', spinWheel);

// 폭죽(Confetti) 효과 함수 (간단한 캔버스 파티클 구현)
function launchConfetti() {
  // 파티클 개수
  const confettiCount = 120;
  // 파티클 배열
  const confettis = [];
  // 폭죽 캔버스 생성
  const confettiCanvas = document.createElement('canvas');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiCanvas.style.position = 'fixed';
  confettiCanvas.style.top = '0';
  confettiCanvas.style.left = '0';
  confettiCanvas.style.pointerEvents = 'none';
  confettiCanvas.style.zIndex = '101';
  confettiDiv.appendChild(confettiCanvas);
  const cctx = confettiCanvas.getContext('2d');
  // 파티클 초기화
  for (let i = 0; i < confettiCount; i++) {
    confettis.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * -confettiCanvas.height,
      r: 6 + Math.random() * 8,
      d: 8 + Math.random() * 8,
      color: sectorColors[Math.floor(Math.random() * sectorColors.length)],
      tilt: Math.random() * 20 - 10,
      tiltAngle: 0,
      tiltAngleIncremental: (Math.random() * 0.07) + 0.05
    });
  }
  // 애니메이션 프레임 함수
  function drawConfetti() {
    // 캔버스 지우기
    cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    // 각 파티클 그리기
    for (let i = 0; i < confettiCount; i++) {
      const c = confettis[i];
      cctx.beginPath();
      cctx.lineWidth = c.r;
      cctx.strokeStyle = c.color;
      cctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
      cctx.lineTo(c.x + c.tilt, c.y + c.d);
      cctx.stroke();
    }
    updateConfetti();
  }
  // 파티클 위치 업데이트 함수
  function updateConfetti() {
    for (let i = 0; i < confettiCount; i++) {
      const c = confettis[i];
      c.y += (Math.cos(i) + 3 + c.d / 2) * 0.8;
      c.tiltAngle += c.tiltAngleIncremental;
      c.tilt = Math.sin(c.tiltAngle) * 16;
      // 화면 아래로 벗어나면 위로 재배치
      if (c.y > confettiCanvas.height) {
        c.x = Math.random() * confettiCanvas.width;
        c.y = -20;
        c.tilt = Math.random() * 20 - 10;
      }
    }
  }
  // 애니메이션 루프
  let confettiFrame;
  function loop() {
    drawConfetti();
    confettiFrame = requestAnimationFrame(loop);
  }
  loop();
  // 3초 후 폭죽 효과 제거
  setTimeout(() => {
    cancelAnimationFrame(confettiFrame);
    confettiDiv.innerHTML = '';
  }, 3000);
} 