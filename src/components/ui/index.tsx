import React from 'react';
import { cn, getInitials, getAvatarColor } from '../../utils';

// ==================== BADGE ====================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange' | 'purple';
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const variantClass = `badge-${variant}`;
  return <span className={cn('badge', variantClass, className)}>{children}</span>;
}

// ==================== BUTTON ====================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, className, disabled, ...props
}: ButtonProps) {
  const variantClass = `btn-${variant}`;
  const sizeClasses = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-base px-5 py-2.5' };
  return (
    <button
      className={cn('btn', variantClass, sizeClasses[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className="spinner" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}

// ==================== CARD ====================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, padding = true, onClick }: CardProps) {
  return (
    <div className={cn('card', !padding && 'p-0', className)} onClick={onClick}>
      {children}
    </div>
  );
}

// ==================== INPUT ====================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function Input({ label, error, leftIcon, rightElement, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="form-label">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={cn('form-input', leftIcon && 'pl-9', rightElement && 'pr-10', error && 'border-red-300 focus:ring-red-500', className)}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

// ==================== SELECT ====================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={selectId} className="form-label">{label}</label>}
      <select id={selectId} className={cn('form-select', error && 'border-red-300', className)} {...props}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

// ==================== TEXTAREA ====================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={textareaId} className="form-label">{label}</label>}
      <textarea
        id={textareaId}
        className={cn('form-input resize-none', error && 'border-red-300', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

// ==================== MODAL ====================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
  if (!isOpen) return null;
  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={cn('modal-content', sizeClasses[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}

// ==================== AVATAR ====================
interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const sizeClasses = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0', sizeClasses[size], getAvatarColor(name), className)}>
      {getInitials(name)}
    </div>
  );
}

// ==================== STAT CARD ====================
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'indigo';
  subtitle?: string;
}

export function StatCard({ title, value, icon, trend, color = 'blue', subtitle }: StatCardProps) {
  const colors = {
    blue: { bg: 'gradient-blue', light: 'bg-blue-50', text: 'text-blue-600' },
    green: { bg: 'gradient-green', light: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'gradient-amber', light: 'bg-amber-50', text: 'text-amber-600' },
    red: { bg: 'gradient-red', light: 'bg-red-50', text: 'text-red-600' },
    purple: { bg: 'gradient-purple', light: 'bg-purple-50', text: 'text-purple-600' },
    indigo: { bg: 'gradient-indigo', light: 'bg-indigo-50', text: 'text-indigo-600' },
  };
  const cfg = colors[color];

  return (
    <div className="stat-card group">
      <div className={cn('p-3 rounded-xl flex-shrink-0', cfg.bg)}>
        <div className="text-white [&>svg]:w-5 [&>svg]:h-5">{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={cn('text-xs font-medium mt-1', trend.value >= 0 ? 'text-emerald-600' : 'text-red-600')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}

// ==================== SEARCH INPUT ====================
interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn('form-input pl-9 pr-4', className)}
      />
    </div>
  );
}

// ==================== EMPTY STATE ====================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-slate-300">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ==================== LOADING SPINNER ====================
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={cn('border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin', sizes[size])} />
  );
}

// ==================== SECTION HEADER ====================
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ==================== PROGRESS BAR ====================
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, max = 100, color = 'bg-blue-500', showLabel = false, size = 'sm' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const heights = { sm: 'h-1.5', md: 'h-2.5' };
  return (
    <div className="flex items-center gap-2">
      <div className={cn('flex-1 rounded-full bg-slate-100 overflow-hidden', heights[size])}>
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs text-slate-500 w-8 text-right">{Math.round(pct)}%</span>}
    </div>
  );
}

// ==================== TOOLTIP ====================
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="tooltip opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
        {content}
      </div>
    </div>
  );
}

// ==================== TABS ====================
interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-slate-200', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all duration-150',
            active === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn('ml-1.5 px-1.5 py-0.5 text-xs rounded-full font-semibold', active === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600')}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ==================== HEALTH BADGE ====================
export function HealthBadge({ score }: { score: number }) {
  const config = score >= 90 ? { label: 'Excellent', cls: 'badge-green' }
    : score >= 70 ? { label: 'Good', cls: 'badge-blue' }
    : score >= 50 ? { label: 'Fair', cls: 'badge-yellow' }
    : { label: 'Critical', cls: 'badge-red' };

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', score >= 90 ? 'bg-emerald-500' : score >= 70 ? 'bg-blue-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500')}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn('badge text-xs', config.cls)}>{score}% {config.label}</span>
    </div>
  );
}
