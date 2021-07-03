import React, { ReactElement } from 'react';

const icons = {
  back: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
      />
    </svg>
  ),
  project: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      ></path>
    </svg>
  ),
  blog: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      ></path>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      ></path>
    </svg>
  ),
  email: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  wechat: (
    <svg
      stroke="currentColor"
      fill="currentColor"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M588.288 370.176c30.208 0 55.808-22.528 55.808-55.808s-25.6-55.808-55.808-55.808-55.296 22.528-55.296 55.808 25.088 55.808 55.296 55.808zM336.896 258.56c-30.208 0-55.296 22.528-55.296 55.808s25.088 55.808 55.296 55.808 55.808-22.528 55.808-55.808-25.6-55.808-55.808-55.808z m239.104 308.224c-18.432 0-37.376 20.992-37.376 41.472 0 20.992 18.944 41.472 37.376 41.472 28.16 0 46.592-20.48 46.592-41.472 0-20.48-18.432-41.472-46.592-41.472z m167.424 0c-18.432 0-36.864 20.992-36.864 41.472 0 20.992 18.432 41.472 36.864 41.472 28.16 0 46.592-20.48 46.592-41.472 0-20.48-18.944-41.472-46.592-41.472zM957.44 660.48c0-75.264-37.888-143.36-96.256-191.488 0.512-3.584 0.512-6.656 0.512-9.728 0-288.256-205.312-394.752-400.384-394.752-218.112 0-396.8 155.648-396.8 353.792 0 114.176 59.392 207.872 158.72 280.576l1.024 93.184 98.304-40.96c34.304 7.168 50.176 10.752 72.704 12.288 44.544 92.672 147.456 157.696 269.824 157.696 34.304 0 69.12-9.216 103.424-17.92l94.72 54.272-26.112-90.112c68.608-53.76 120.32-125.952 120.32-206.848z m-586.24 0c0 15.36 1.536 30.208 4.096 44.544-8.704-1.536-18.432-3.584-31.744-6.144-3.584-0.512-6.656-1.536-10.24-2.048l-16.896-3.584-15.872 6.656-21.504 9.216v-10.24l-0.512-28.16-22.528-16.384c-44.544-32.768-78.848-69.12-101.376-108.032-11.264-19.456-19.968-39.936-25.6-60.928-5.632-21.504-8.704-44.032-8.704-67.072 0-79.36 34.816-153.6 97.792-209.408 31.232-27.648 67.584-49.664 108.544-64.512 42.496-15.872 87.552-24.064 134.656-24.064 45.056 0 88.576 6.144 128.512 18.432 41.984 13.312 78.848 32.768 109.568 57.856 32.768 27.136 58.88 61.44 76.288 101.888 17.408 38.912 27.136 83.968 29.696 134.144-42.496-21.504-90.624-33.28-140.288-33.28-164.864 0-293.888 117.248-293.888 261.12z m431.104 163.328l-26.112 20.48h-0.512l-22.016 5.632c-31.744 8.192-61.952 16.384-89.6 16.384-33.28 0-65.536-5.632-95.232-16.896-28.672-10.752-53.76-26.112-75.776-45.568-43.008-38.4-66.56-89.088-66.56-142.848s23.552-104.448 66.56-142.848c21.504-19.456 47.104-34.816 75.776-45.568 30.208-11.264 61.952-16.896 95.232-16.896 31.232 0 61.952 5.632 91.136 16.896 28.672 10.752 54.272 26.112 76.288 45.568 22.016 19.456 38.912 41.472 51.2 65.536 12.288 24.576 18.432 50.688 18.432 76.8 0 28.16-8.704 56.32-26.112 84.48-16.896 27.648-41.472 53.76-72.704 78.848z"></path>
    </svg>
  ),
  loading: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  ),
  delete: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  'arrow-right': (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  code: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
    </svg>
  ),
  plus: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  ),
  save: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  ),
  clock: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  hits: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  close: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  skin: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      ></path>
    </svg>
  ),
};

interface Props {
  type: keyof typeof icons;
  className?: string;
  onClick?: React.MouseEventHandler<any>;
}

export default function Icon({
  type,
  className = 'w-5 h-5',
  ...other
}: Props): ReactElement {
  if (icons[type]) {
    return React.cloneElement(icons[type], { className, ...other });
  }
  return null;
}
