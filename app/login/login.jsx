'use client';

import React from 'react';

const IconedLoginForm = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-primarylw">
      <div className="w-full max-w-xs m-auto bg-white rounded p-4 md:p-6 relative border border-gray-200 rounded-xl shadow-sm">
        <div className="w-full flex items-center justify-center py-4">
          <div className="text-center -mt-4 mb-2">
            <h2 className="text-gray-900 text-2xl font-semibold">Login Here</h2>
          </div>
        </div>

        <form>
          <div>
            <label className="block ml-1 mb-1 text-gray-700 text-sm" htmlFor="username">
              Username
            </label>
            <input
              className="w-full p-2 pl-3 mb-4 text-gray-900 border-b-2 border-gray-300 bg-white outline-none focus:border-blue-500 rounded-full"
              type="text"
              name="username"
              id="username"
            />
          </div>

          <div>
            <label className="block ml-1 mb-1 text-gray-700" htmlFor="password">Password</label>
            <input
              className="w-full p-2 pl-3 mb-4 text-gray-900 border-b-2 border-gray-300 bg-white outline-none focus:border-blue-500 rounded-full"
              type="password"
              name="password"
              id="password"
            />
          </div>

          <div className="relative">
            <input
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 mb-6 mt-4 cursor-pointer rounded-full"
              type="submit"
              value="Login"
            />
          </div>

          <div className="flex gap-1">
            <button
              type="button"
              className="w-full border border-blue-700 hover:bg-blue-700 hover:text-white text-gray-700 text-sm py-2 px-4 mb-6 cursor-pointer rounded-full flex items-center justify-center gap-1"
            >
              <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 0 48 48" version="1.1">
                <g id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <g id="Color-" transform="translate(-401.000000, -860.000000)">
                    <g id="Google" transform="translate(401.000000, 860.000000)">
                      <path
                        d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                        id="Fill-1" fill="#FBBC05">
                      </path>
                      <path
                        d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                        id="Fill-2" fill="#EB4335">
                      </path>
                      <path
                        d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                        id="Fill-3" fill="#34A853">
                      </path>
                      <path
                        d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                        id="Fill-4" fill="#4285F4">
                      </path>
                    </g>
                  </g>
                </g>
              </svg>
              <span className="hidden md:flex">Google</span>
            </button>

            <button
              type="button"
              className="w-full bg-black text-white text-sm px-4 mb-6 py-1 cursor-pointer rounded-full flex items-center justify-center gap-1"
            >
              <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 -4 48 48" version="1.1">
                <g id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <g id="Color-" transform="translate(-300.000000, -164.000000)" fill="#00AAEC">
                    <path
                      d="M348,168.735283 C346.236309,169.538462 344.337383,170.081618 342.345483,170.324305 C344.379644,169.076201 345.940482,167.097147 346.675823,164.739617 C344.771263,165.895269 342.666667,166.736006 340.418384,167.18671 C338.626519,165.224991 336.065504,164 333.231203,164 C327.796443,164 323.387216,168.521488 323.387216,174.097508 C323.387216,174.88913 323.471738,175.657638 323.640782,176.397255 C315.456242,175.975442 308.201444,171.959552 303.341433,165.843265 C302.493397,167.339834 302.008804,169.076201 302.008804,170.925244 C302.008804,174.426869 303.747139,177.518238 306.389857,179.329722 C304.778306,179.280607 303.256911,178.821235 301.9271,178.070061 L301.9271,178.194294 C301.9271,183.08848 305.322064,187.17082 309.8299,188.095341 C309.004402,188.33225 308.133826,188.450704 307.235077,188.450704 C306.601162,188.450704 305.981335,188.390033 305.381229,188.271578 C306.634971,192.28169 310.269414,195.2026 314.580032,195.280607 C311.210424,197.99061 306.961789,199.605634 302.349709,199.605634 C301.555203,199.605634 300.769149,199.559408 300,199.466956 C304.358514,202.327194 309.53689,204 315.095615,204 C333.211481,204 343.114633,188.615385 343.114633,175.270495 C343.114633,174.831347 343.106181,174.392199 343.089276,173.961719 C345.013559,172.537378 346.684275,170.760563 348,168.735283"
                      id="Twitter">
                    </path>
                  </g>
                </g>
              </svg>
              <span className="hidden md:flex">Twitter</span>
            </button>
          </div>
        </form>

        <footer>
          <a className="text-blue-600 hover:text-blue-800 text-xs md:text-sm float-left" href="#">Forgot Password?</a>
          <a className="text-blue-600 hover:text-blue-800 text-xs md:text-sm float-right" href="#">Create Account</a>
        </footer>
      </div>
    </div>
  );
};

export default function Page() {
  return <IconedLoginForm />;
}
