"use client";
import { Button } from "@/components/ui/button";
import Silk from "@/features/auth/components/animation/Silk";
import { LOGO_MAIN_COLOR } from "@/constants/constants";
import { motion } from "framer-motion";

const AuthPageClient = () => {
  return (
    <div className="grid min-h-svh md:grid-cols-2 bg-background">
      <motion.div
        className="w-full flex items-center justify-center flex-col gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="w-[85%] items-center justify-center flex flex-col gap-2"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1 },
          }}
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.h1
            className="text-3xl font-semibold text-center mb-6"
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            Sign In
          </motion.h1>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="w-full"
          >
            <Button variant="outline" className="w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-2 h-5 w-5"
              >
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  fill="currentColor"
                />
              </svg>
              Login with GitHub
            </Button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="w-full"
          >
            <Button variant="outline" className="w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-2 h-5 w-5"
              >
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Login with Google
            </Button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="w-full"
          >
            <Button variant="outline" className="w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-2 h-5 w-5"
              >
                <path
                  d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16zm.5 3a2.5 2.5 0 012.5 2.5v7a.5.5 0 01-.5.5h-5a.5.5 0 01-.5-.5v-2a.5.5 0 01.5-.5h3v-4.5a.5.5 0 011 0V12a.5.5 0 01-.5.5h-3v1.5h4v-4.5A1.5 1.5 0 0012 8v-.5a.5.5 0 01.5-.5z"
                  fill="currentColor"
                />
              </svg>
              Login with Reddit
            </Button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="w-full"
          >
            <Button variant="outline" className="w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-2 h-5 w-5"
              >
                <path
                  d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.39-.444.977-.608 1.414a19.98 19.98 0 0 0-5.49 0 12.78 12.78 0 0 0-.617-1.414.077.077 0 0 0-.079-.036c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.202 13.202 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.35-1.22.645-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"
                  fill="currentColor"
                />
              </svg>
              Login with Discord
            </Button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="w-full"
          >
            <Button variant="outline" className="w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-2 h-5 w-5"
              >
                <path
                  d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"
                  fill="currentColor"
                />
              </svg>
              Login with Microsoft
            </Button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="w-full"
          >
            <Button
              variant="outline"
              className="w-full"
              style={{
                backgroundColor: "var(--navbar-button-bg)",
                border: "1px solid var(--navbar-input-border)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-2 h-5 w-5"
              >
                <path
                  d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.57 7.768a3.45 3.45 0 0 0-1.546-1.547c-.652-.317-1.373-.477-2.173-.477-.821 0-1.564.175-2.221.527-.658.351-1.177.835-1.562 1.454-.383.615-.576 1.304-.576 2.066 0 .768.189 1.45.57 2.06.38.61.899 1.086 1.559 1.437.66.351 1.419.525 2.234.525.801 0 1.513-.16 2.163-.487a3.48 3.48 0 0 0 1.558-1.547c.361-.691.544-1.478.544-2.332 0-.784-.188-1.484-.551-2.179z"
                  fill="currentColor"
                />
              </svg>
              Login with Apple
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div
        className="hidden md:block w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Silk
          speed={5}
          scale={1}
          color={LOGO_MAIN_COLOR}
          noiseIntensity={1.5}
          rotation={0}
        />
      </motion.div>
    </div>
  );
};

export default AuthPageClient;
