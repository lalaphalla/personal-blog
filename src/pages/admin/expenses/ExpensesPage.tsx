import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DeleteIcon from '@mui/icons-material/Delete'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useExpenseMutations, useExpenses } from '../../../hooks/useExpenseQueries'
import type { ExpenseItem } from '../../../services/expenseApi'
import { getLocalTodayDateString } from '../../../utils/journal'

const CATEGORIES = [
  'Food',
  'Coffee',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Other',
]

const PAYMENT_METHODS = ['Card', 'Cash', 'Transfer', 'Other']

function getCurrentMonth(): string {
  const today = getLocalTodayDateString()
  return today.slice(0, 7)
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  const yr = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  return `${yr}-${mo}`
}

function formatMoney(amount: number, currency = 'USD'): string {
  return `${currency === 'USD' ? '$' : `${currency} `}${amount.toFixed(2)}`
}

export default function ExpensesPage() {
  const todayStr = getLocalTodayDateString()
  const [month, setMonth] = useState(getCurrentMonth)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Quick add state
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [expenseDate, setExpenseDate] = useState(todayStr)
  const [paymentMethod, setPaymentMethod] = useState('Card')

  // Edit dialog state
  const [editing, setEditing] = useState<ExpenseItem | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('Food')
  const [editNote, setEditNote] = useState('')
  const [editDate, setEditDate] = useState(todayStr)
  const [editMethod, setEditMethod] = useState('Card')

  const expensesQuery = useExpenses(month, categoryFilter)
  const mutations = useExpenseMutations()

  const summary = expensesQuery.data?.summary
  const byCategory = expensesQuery.data?.by_category ?? []
  const items = expensesQuery.data?.items ?? []

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const num = Number(amount)
    if (!Number.isFinite(num) || num <= 0) return

    mutations.create.mutate(
      {
        amount: num,
        category,
        note: note.trim() || null,
        expense_date: expenseDate || todayStr,
        payment_method: paymentMethod,
      },
      {
        onSuccess: () => {
          setAmount('')
          setNote('')
        },
      },
    )
  }

  const openEdit = (item: ExpenseItem) => {
    setEditing(item)
    setEditAmount(String(item.amount))
    setEditCategory(item.category)
    setEditNote(item.note ?? '')
    setEditDate(item.expense_date)
    setEditMethod(item.payment_method)
  }

  const handleSaveEdit = () => {
    if (!editing) return
    const num = Number(editAmount)
    if (!Number.isFinite(num) || num <= 0) return
    mutations.update.mutate(
      {
        id: editing.id,
        input: {
          amount: num,
          category: editCategory,
          note: editNote.trim() || null,
          expense_date: editDate,
          payment_method: editMethod,
        },
      },
      { onSuccess: () => setEditing(null) },
    )
  }

  return (
    <Stack spacing={3}>
      {/* Header & Month Selector */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Expenses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fast daily expense log with monthly category breakdown.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            aria-label="Previous month"
          >
            <ChevronLeftIcon />
          </IconButton>
          <TextField
            type="month"
            size="small"
            value={month}
            onChange={(e) => {
              if (e.target.value) setMonth(e.target.value)
            }}
          />
          <IconButton
            size="small"
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            aria-label="Next month"
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Quick 5-Second Add Bar */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
            Quick Log Expense
          </Typography>
          <Box component="form" onSubmit={handleQuickAdd}>
            <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  label="Amount"
                  type="number"
                  size="small"
                  fullWidth
                  required
                  slotProps={{ htmlInput: { step: '0.01', min: '0.01' } }}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Note"
                  size="small"
                  fullWidth
                  placeholder="Lunch, Grab, coffee…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  label="Date"
                  type="date"
                  size="small"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Method</InputLabel>
                  <Select
                    label="Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 1.5 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  disabled={mutations.create.isPending || !amount || Number(amount) <= 0}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* KPI Summary Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Spent ({month})
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                {formatMoney(summary?.month_total ?? 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Spent Today
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                {formatMoney(summary?.today_total ?? 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Daily Avg
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                {formatMoney(summary?.avg_per_day ?? 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Transactions
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                {summary?.count ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content: Category Breakdown + Transactions */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                By Category
              </Typography>
              {expensesQuery.isPending ? (
                <CircularProgress size={24} />
              ) : byCategory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No expenses logged for {month}.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {byCategory.map((cat) => (
                    <Box key={cat.category}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {cat.category} ({cat.count})
                        </Typography>
                        <Typography variant="body2">
                          {formatMoney(cat.total)} · {cat.percent}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, cat.percent)}
                        sx={{ height: 7, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}
              >
                <Typography variant="h6">Transactions</Typography>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip
                    label="All"
                    size="small"
                    color={categoryFilter === 'all' ? 'primary' : 'default'}
                    onClick={() => setCategoryFilter('all')}
                  />
                  {byCategory.map((c) => (
                    <Chip
                      key={c.category}
                      label={c.category}
                      size="small"
                      color={categoryFilter === c.category ? 'primary' : 'default'}
                      onClick={() =>
                        setCategoryFilter((prev) => (prev === c.category ? 'all' : c.category))
                      }
                    />
                  ))}
                </Stack>
              </Stack>

              {expensesQuery.isPending ? (
                <CircularProgress size={24} />
              ) : items.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  No transactions in this filter.
                </Typography>
              ) : (
                <Stack divider={<Divider flexItem />} spacing={0.5}>
                  {items.map((item) => (
                    <Stack
                      key={item.id}
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: 'center', py: 1 }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {item.note || item.category}
                          </Typography>
                          <Chip label={item.category} size="small" variant="outlined" />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {item.expense_date} · {item.payment_method}
                        </Typography>
                      </Box>

                      <Typography variant="subtitle2" sx={{ fontWeight: 700, flexShrink: 0 }}>
                        {formatMoney(item.amount, item.currency)}
                      </Typography>

                      <IconButton size="small" onClick={() => openEdit(item)} aria-label="Edit expense">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={mutations.remove.isPending}
                        onClick={() => mutations.remove.mutate(item.id)}
                        aria-label="Delete expense"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Amount"
              type="number"
              size="small"
              fullWidth
              slotProps={{ htmlInput: { step: '0.01', min: '0.01' } }}
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Note"
              size="small"
              fullWidth
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
            />
            <TextField
              label="Date"
              type="date"
              size="small"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Payment Method</InputLabel>
              <Select
                label="Payment Method"
                value={editMethod}
                onChange={(e) => setEditMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={mutations.update.isPending || !editAmount || Number(editAmount) <= 0}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
