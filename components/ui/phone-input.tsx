"use client"

import { forwardRef, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("")

    useEffect(() => {
      if (value) {
        setDisplayValue(formatPhone(value))
      }
    }, [value])

    const formatPhone = (phone: string): string => {
      // Remove tudo que não é número
      const numbers = phone.replace(/\D/g, "")
      
      // Limita a 11 dígitos (DDD + 9 dígitos)
      const limited = numbers.slice(0, 11)
      
      // Aplica a máscara brasileira: (DD) 9XXXX-XXXX
      if (limited.length === 0) {
        return ""
      } else if (limited.length <= 2) {
        return `(${limited}`
      } else if (limited.length <= 7) {
        return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
      } else if (limited.length <= 10) {
        // Formato antigo: (DD) XXXX-XXXX
        return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`
      } else {
        // Formato novo: (DD) 9XXXX-XXXX
        return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const formatted = formatPhone(inputValue)
      setDisplayValue(formatted)

      // Extrai apenas os números para o valor real
      const numbers = formatted.replace(/\D/g, "")
      
      // Cria um novo evento com o valor apenas numérico
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: numbers,
        },
      } as React.ChangeEvent<HTMLInputElement>

      if (onChange) {
        onChange(syntheticEvent)
      }
    }

    return (
      <Input
        ref={ref}
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder="(00) 00000-0000"
        maxLength={15}
        className={cn(className)}
        {...props}
      />
    )
  }
)

PhoneInput.displayName = "PhoneInput"

export { PhoneInput }

