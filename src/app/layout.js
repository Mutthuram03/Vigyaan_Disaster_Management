'use client'

import './globals.css'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import { AuthContextProvider } from '../contexts/AuthContext'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <AuthContextProvider>
          {children}
        </AuthContextProvider>

        {/* ✅ Chatbase chatbot integration (updated version) */}
        <Script id="chatbase-loader" strategy="afterInteractive">
          {`
            (function(){
              if(!window.chatbase||window.chatbase("getState")!=="initialized"){
                window.chatbase=(...arguments)=>{
                  if(!window.chatbase.q){window.chatbase.q=[]}
                  window.chatbase.q.push(arguments)
                };
                window.chatbase=new Proxy(window.chatbase,{
                  get(target,prop){
                    if(prop==="q"){return target.q}
                    return(...args)=>target(prop,...args)
                  }
                });
              }
              const onLoad=function(){
                const script=document.createElement("script");
                script.src="https://www.chatbase.co/embed.min.js";
                script.id="C2LX_a0UxKF1BqpD2gK1l";
                script.domain="www.chatbase.co";
                document.body.appendChild(script);
              };
              if(document.readyState==="complete"){
                onLoad();
              }else{
                window.addEventListener("load",onLoad);
              }
            })();
          `}
        </Script>
      </body>
    </html>
  )
}
