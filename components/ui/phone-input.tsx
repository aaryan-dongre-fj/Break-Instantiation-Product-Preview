"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"
import "react-phone-number-input/style.css"
import en from "react-phone-number-input/locale/en.json"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type PhoneInputProps = Omit<
  React.ComponentProps<typeof RPNInput.default>,
  "onChange"
> & {
  onChange?: (value: RPNInput.Value) => void
}

const PhoneInput = React.forwardRef<
  React.ElementRef<typeof RPNInput.default>,
  PhoneInputProps
>(({ className, onChange, ...props }, ref) => {
  return (
    <RPNInput.default
      ref={ref}
      className={cn("flex", className)}
      flags={flags}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      labels={en}
      smartCaret={false}
      onChange={(value) => onChange?.(value as RPNInput.Value)}
      {...props}
    />
  )
})
PhoneInput.displayName = "PhoneInput"

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <Input
    className={cn(
      "rounded-e-full rounded-s-none h-12 border-l-0 bg-white/60 border-black/10 focus-visible:ring-0 focus-visible:border-secondary-background",
      className
    )}
    {...props}
    ref={ref}
  />
))
InputComponent.displayName = "InputComponent"

type CountrySelectOption = { label: string; value: RPNInput.Country }

type CountrySelectProps = {
  disabled?: boolean
  value: RPNInput.Country
  onChange: (value: RPNInput.Country) => void
  options: CountrySelectOption[]
  iconComponent: React.ComponentType<{ country: RPNInput.Country; label: string }>
}

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
  iconComponent: Flag,
}: CountrySelectProps) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)

  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    const lowerSearch = search.toLowerCase()
    return options.filter((option) =>
      option.label.toLowerCase().includes(lowerSearch) ||
      (option.value && RPNInput.getCountryCallingCode(option.value).includes(lowerSearch))
    )
  }, [search, options])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  React.useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  const handleSelect = (country: RPNInput.Country) => {
    onChange(country)
    setOpen(false)
  }

  const selectedOption = options.find((o) => o.value === value)

  return (
    <div
      className="relative phone-input-country-trigger"
      ref={ref}
      style={
        {
          "--PhoneInputCountryFlag-borderWidth": "0px",
          "--PhoneInputCountryFlag-borderColor": "transparent",
          "--PhoneInputCountryFlag-backgroundColor--loading": "transparent",
        } as React.CSSProperties
      }
    >
      <Button
        type="button"
        variant="outline"
        className={cn(
          "flex gap-2 rounded-e-none rounded-s-full px-4 border-r-0 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-black/10 bg-white/60 border-black/10 h-12 hover:bg-white/60 hover:text-inherit",
          disabled && "cursor-not-allowed opacity-50"
        )}
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        <span className="flex shrink-0">
          <Flag country={value} label={selectedOption?.label || ""} />
        </span>
        {value && (
          <span className="text-sm font-medium text-black/60">
            +{RPNInput.getCountryCallingCode(value)}
          </span>
        )}
        <ChevronsUpDown className="ml-0.5 h-3 w-3 opacity-30" />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="country-dropdown"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 bottom-full z-50 mb-2 w-[280px] origin-bottom-left rounded-xl border border-black/10 bg-white p-1 shadow-xl outline-none"
          >
            <div className="px-2 py-2 border-b border-black/5 mb-1">
               <div className="relative">
                 <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-black/30" />
                 <input
                   className="w-full rounded-lg bg-black/5 px-8 py-2 text-sm outline-none placeholder:text-black/30 focus:ring-1 focus:ring-black/20"
                   placeholder="Search country..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   autoFocus
                 />
               </div>
            </div>
            <div
              className="max-h-[250px] overflow-y-scroll overscroll-contain pr-3"
              onWheel={(event) => event.stopPropagation()}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value ?? option.label}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5",
                      value === option.value && "bg-black/5 font-medium text-primary-text"
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <Flag country={option.value} label={option.label} />
                    <span className="ml-2 flex-1 truncate">
                      {option.label}
                    </span>
                    {option.value && (
                      <span className="ml-2 text-black/40 text-xs tabular-nums">
                        +{RPNInput.getCountryCallingCode(option.value)}
                      </span>
                    )}
                    {value === option.value && (
                      <Check className="ml-auto h-4 w-4 text-primary-text" />
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-black/40">
                  No country found.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { PhoneInput }
