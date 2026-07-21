import {
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  X,
} from "lucide-react";

const variants = {
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: AlertCircle,
    button:
      "bg-red-600 hover:bg-red-700",
  },

  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    icon: AlertTriangle,
    button:
      "bg-yellow-600 hover:bg-yellow-700",
  },

  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: Info,
    button:
      "bg-blue-600 hover:bg-blue-700",
  },
};

const ErrorAlert = ({
  title = "Something went wrong",

  message = "",

  variant = "error",

  onRetry,

  onDismiss,

  retryText = "Retry",

  dismissible = true,
}) => {
  const current =
    variants[variant] ||
    variants.error;

  const Icon = current.icon;

  return (
    <div
      className={`
        ${current.bg}
        ${current.border}
        border
        rounded-xl
        p-5
        shadow-sm
      `}
    >
      <div className="flex justify-between">

        <div className="flex gap-4">

          <Icon
            size={28}
            className={current.text}
          />

          <div>

            <h3
              className={`font-semibold text-lg ${current.text}`}
            >
              {title}
            </h3>

            {message && (
              <p className="mt-1 text-gray-700">
                {message}
              </p>
            )}

          </div>

        </div>

        {dismissible && (
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-black"
          >
            <X size={20} />
          </button>
        )}

      </div>

      {(onRetry || onDismiss) && (
        <div className="mt-5 flex gap-3">

          {onRetry && (
            <button
              onClick={onRetry}
              className={`
                flex
                items-center
                gap-2
                text-white
                px-4
                py-2
                rounded-lg
                transition
                ${current.button}
              `}
            >
              <RefreshCw size={18} />

              {retryText}
            </button>
          )}

          {dismissible &&
            onDismiss && (
              <button
                onClick={onDismiss}
                className="
                  px-4
                  py-2
                  rounded-lg
                  border
                  hover:bg-gray-100
                "
              >
                Dismiss
              </button>
            )}

        </div>
      )}
    </div>
  );
};

export default ErrorAlert;