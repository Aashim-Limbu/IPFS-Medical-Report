"use client";
import Link from "next/link";
import BackgroundImage from "../public/Background.png";
import Image from "next/image";
import Doctor from "../public/doctor.png";
import {motion} from "motion/react";
import {easeOut, easeInOut} from "motion/react";
import {useEffect, useState} from "react";

const container = {
    hidden: {opacity: 0},
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
        },
    },
};

const item = {
    hidden: {opacity: 0, y: 20},
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: easeOut,
        },
    },
};

const floating = {
    initial: {y: 0},
    animate: {
        y: [0, -20, 0],
        transition: {
            duration: 5,
            repeat: Infinity,
            ease: easeInOut,
        },
    },
};

const pulse = {
    initial: {scale: 1},
    animate: {
        scale: [1, 1.03, 1],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: easeInOut,
        },
    },
};

export default function Home() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <div className="h-screen w-full relative overflow-hidden">
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 1}}
                className="absolute inset-0 -z-10"
            >
                <Image src={BackgroundImage} alt="background" fill className="object-cover" />
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-cyan-500/20"
                    animate={{opacity: [0.2, 0.4, 0.2]}}
                    transition={{duration: 8, repeat: Infinity}}
                />
            </motion.div>

            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-white/30 backdrop-blur-sm"
                    style={{
                        width: Math.random() * 15 + 5,
                        height: Math.random() * 15 + 5,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, Math.random() * 100 - 50],
                        x: [0, Math.random() * 100 - 50],
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 15,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Animated navigation */}
            <motion.nav
                initial={{y: -100}}
                animate={{y: 0}}
                transition={{type: "spring", damping: 15}}
                className="flex flex-row items-center justify-between fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-md p-4 z-20"
            >
                <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                    <Link
                        href="/"
                        className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#456fe8] to-[#19b0ec] font-extrabold font-mono tracking-wider"
                    >
                        MEDREPO
                    </Link>
                </motion.div>
                <div className="flex flex-row space-x-4">
                    <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                        <Link
                            href="/login"
                            className="text-xl bg-[#084081] p-2 px-6 rounded-md font-semibold text-white shadow-lg hover:bg-[#0a52b0] transition-colors"
                        >
                            Login
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                        <Link
                            href="/register"
                            className="text-xl bg-white p-2 px-4 rounded-md font-semibold text-[#084081] ring-[#084081] ring-2 shadow-lg hover:bg-[#084081] hover:text-white transition-colors"
                        >
                            Register
                        </Link>
                    </motion.div>
                </div>
            </motion.nav>

            <div className="pt-28 flex flex-col gap-y-8 lg:flex-row items-center lg:justify-around lg:space-x-2 h-full w-full px-4">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="w-full order-2 lg:-order-2 text-center lg:text-left md:flex md:flex-col md:space-y-6 max-w-xl lg:max-w-2xl backdrop-blur-md rounded-xl p-8 text-gray-800 bg-white/30 shadow-2xl ring-1 ring-white/50"
                >
                    <motion.h2
                        variants={item}
                        className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#084081] to-[#19b0ec]"
                    >
                        MedRepo
                    </motion.h2>
                    <motion.p
                        variants={item}
                        className="text-xl md:text-2xl leading-relaxed font-medium text-gray-800 mt-4"
                    >
                        Say goodbye to fragmented, insecure, and outdated health record systems. Our decentralized EHR
                        platform powered by IPFS technology ensures secure, lightning-fast access to medical data.
                    </motion.p>
                    <motion.div variants={item} className="mt-6">
                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 5px 25px rgba(8, 64, 129, 0.5)",
                                backgroundColor: "#0a52b0",
                            }}
                            whileTap={{scale: 0.95}}
                            className="bg-[#084081] rounded-xl font-bold text-white py-3 px-8 text-xl shadow-lg"
                        >
                            Get Started
                        </motion.button>
                    </motion.div>
                </motion.div>

                <motion.div
                    variants={floating}
                    initial="initial"
                    animate="animate"
                    className="relative aspect-square w-full sm:w-96 xl:w-[30rem] bg-gradient-to-br from-[#084081] to-[#19b0ec] shadow-2xl flex items-center justify-center overflow-hidden"
                    style={{
                        clipPath:
                            "polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%)",
                    }}
                >
                    <motion.div variants={pulse} initial="initial" animate="animate" className="absolute inset-0">
                        <Image src={Doctor} alt="doctor" fill className="object-cover" />
                    </motion.div>

                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-600/20"
                        animate={{opacity: [0.1, 0.3, 0.1]}}
                        transition={{duration: 4, repeat: Infinity}}
                    />
                </motion.div>
            </div>

            <motion.div
                className="absolute bottom-6 left-0 right-0 flex justify-center space-x-8"
                initial={{opacity: 0, y: 50}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 1, duration: 0.8}}
            >
                {["Secure", "Decentralized", "Fast Access", "IPFS Powered"].map((feature, i) => (
                    <motion.div
                        key={i}
                        className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg font-medium text-[#084081]"
                        whileHover={{y: -5, backgroundColor: "#084081", color: "white"}}
                        transition={{type: "spring", stiffness: 300}}
                    >
                        {feature}
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
