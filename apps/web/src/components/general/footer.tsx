export function Footer() {
  return (
    <>
      {/* Footer for larger screens only */}
      <div className="hidden lg:block fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[999999]">
        <div className="flex flex-row items-center justify-center">
          <p className="text-sm text-[#7e7b76] font-manrope_1 text-center">
            By signing in, you agree to our{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-black dark:hover:text-white transition-colors">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-black dark:hover:text-white transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Footer for mobile only */}
      <div className="lg:hidden w-full max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center text-center w-full">
          <p className="text-sm text-[#7e7b76] font-manrope_1">
            By signing in, you agree to our{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-black dark:hover:text-white transition-colors">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-black dark:hover:text-white transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </>
  );
}