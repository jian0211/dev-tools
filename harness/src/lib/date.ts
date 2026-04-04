/** 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환 */
export function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}
