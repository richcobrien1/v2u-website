// components/Panel.tsx
export default function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#212121ff] text-white p-6 mb-8">
      {children}
    </div>
  )
}