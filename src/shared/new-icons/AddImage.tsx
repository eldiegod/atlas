import * as React from 'react'

function SvgAddImage(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 3a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm5 1h2v3h3v2H9v3H7V9H4V7h3V4z"
        fill="#F4F6F8"
      />
    </svg>
  )
}

export default SvgAddImage
