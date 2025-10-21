// components/footer.tsx
export function Footer() {
  return (
    <footer className="border-t bg-muted/50 py-6 mt-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
        <p className="text-muted-foreground">&copy; 2025 MyCompany. All rights reserved.</p>

        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  )
}
