// components/Panel.tsx
export default function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-gradient-to-b from-[#111111ff] to-black p-6 mb-8 shadow-lg">
      {children}
    </div>
  )
}