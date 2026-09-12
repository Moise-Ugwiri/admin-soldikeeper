import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, List, ListItemButton, ListItemText, Typography, Divider, Stack,
  TextField, Button, Chip, CircularProgress, Alert, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import SyncIcon from '@mui/icons-material/Sync';
import MailIcon from '@mui/icons-material/Mail';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const API = process.env.REACT_APP_API_URL || '/api';

function authHeaders() {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function call(path, options = {}) {
  const res = await fetch(`${API}/admin/support${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) throw new Error(body.error || `Request failed (${res.status})`);
  return body.data;
}

function whenever(date) {
  if (!date) return '';
  const d = new Date(date);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

/**
 * support@soldikeeper.com as a mailbox.
 *
 * Reads over IMAP and sends through Resend, which is what already delivers
 * transactional mail from this address — so replies come from the same place
 * customers are used to, and thread properly via In-Reply-To.
 */
export default function SupportMailbox() {
  const [folders, setFolders] = useState([]);
  const [folder, setFolder] = useState('INBOX');
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [status, setStatus] = useState(null);

  const [compose, setCompose] = useState(null); // { to, subject, text, inReplyTo, references }
  const [sending, setSending] = useState(false);
  const [diag, setDiag] = useState(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [tryUser, setTryUser] = useState('');

  const load = useCallback(async (f = folder) => {
    setLoading(true);
    setError(null);
    try {
      const data = await call(`/mailbox?folder=${encodeURIComponent(f)}&limit=40`);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    call('/inbox/status').then(setStatus).catch(() => {});
    call('/mailbox/folders').then(setFolders).catch(() => {});
  }, []);

  useEffect(() => { load(folder); }, [folder, load]);

  const open = async (msg) => {
    setReading(true);
    setSelected(null);
    setError(null);
    try {
      setSelected(await call(`/mailbox/${msg.uid}?folder=${encodeURIComponent(folder)}`));
      setMessages((prev) => prev.map((m) => (m.uid === msg.uid ? { ...m, seen: true } : m)));
    } catch (err) {
      setError(err.message);
    } finally {
      setReading(false);
    }
  };

  const replyTo = (msg) => setCompose({
    to: msg.fromEmail,
    subject: /^re:/i.test(msg.subject) ? msg.subject : `Re: ${msg.subject}`,
    text: `\n\n---\nOn ${new Date(msg.date).toLocaleString()}, ${msg.fromName || msg.fromEmail} wrote:\n`
      + String(msg.text || '').split('\n').map((l) => `> ${l}`).join('\n'),
    inReplyTo: msg.messageId,
    references: msg.references || [],
  });

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      await call('/mailbox/send', { method: 'POST', body: JSON.stringify(compose) });
      setNotice(`Sent to ${compose.to}`);
      setCompose(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  /**
   * Reading fails for a handful of very different reasons — a group address
   * with no login, IMAP switched off, a blocked port. Walk the connection and
   * show which step stops, rather than leaving a bare request failure.
   */
  const diagnose = async (asUser) => {
    setDiagnosing(true);
    setError(null);
    try {
      const qs = asUser ? `?user=${encodeURIComponent(asUser)}` : '';
      setDiag(await call(`/inbox/diagnose${qs}`));
      call('/inbox/status').then(setStatus).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setDiagnosing(false);
    }
  };

  const sync = async () => {
    try {
      const r = await call('/inbox/sync', { method: 'POST' });
      setNotice(`Synced — ${r.created} new ticket(s), ${r.threaded} threaded, ${r.skipped} skipped`);
      load(folder);
    } catch (err) {
      setError(err.message);
    }
  };

  const notConfigured = status && status.configured === false;
  const unread = useMemo(() => messages.filter((m) => !m.seen).length, [messages]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={2}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            <MailIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#10b981' }} />
            Support inbox
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {status?.mailbox || 'support@soldikeeper.com'}
            {unread > 0 && ` · ${unread} unread`}
          </Typography>
          {status?.scopedTo && (
            <Typography variant="caption" color="text.secondary">
              Showing only mail addressed to <strong>{status.scopedTo}</strong> — the rest of this
              account is not read and is never marked as seen.
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          {folders.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select value={folder} onChange={(e) => setFolder(e.target.value)}>
                {folders.map((f) => <MenuItem key={f.path} value={f.path}>{f.name}</MenuItem>)}
              </Select>
            </FormControl>
          )}
          <Button size="small" startIcon={<RefreshIcon />} onClick={() => load(folder)} disabled={loading}>
            Refresh
          </Button>
          <Tooltip title="Test the mailbox connection step by step">
            <span><Button size="small" startIcon={<HealthAndSafetyIcon />} onClick={() => diagnose(tryUser.trim() || undefined)} disabled={diagnosing}>
              {diagnosing ? 'Testing…' : 'Diagnose'}
            </Button></span>
          </Tooltip>
          <Tooltip title="Turn new mail into support tickets now">
            <span><Button size="small" startIcon={<SyncIcon />} onClick={sync} disabled={notConfigured}>
              Sync to tickets
            </Button></span>
          </Tooltip>
          <Button
            size="small" variant="contained" startIcon={<EditIcon />}
            onClick={() => setCompose({ to: '', subject: '', text: '' })}
          >
            Compose
          </Button>
        </Stack>
      </Stack>

      {notConfigured && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Mailbox not connected. Set <code>SUPPORT_IMAP_PASSWORD</code> on the server to a Google
          <strong> App Password</strong> (the account password will not work with IMAP), then redeploy.
          Sending also needs <code>RESEND_API_KEY</code>.
        </Alert>
      )}
      {status?.lastError && !notConfigured && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Last connection attempt failed ({status.lastError.reason}): {status.lastError.detail}
          {status.lastError.raw && (
            <Typography variant="caption" display="block" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
              Server replied: {status.lastError.raw}
            </Typography>
          )}
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {diag && !diag.ok && (
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Only one address on the domain is the real mailbox — the other is an alias. Test a
            different sign-in without redeploying; the stored App Password is reused.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center" flexWrap="wrap" useFlexGap>
            <TextField
              size="small" placeholder="hello@soldikeeper.com" value={tryUser}
              onChange={(e) => setTryUser(e.target.value)} sx={{ minWidth: 260 }}
            />
            <Button
              size="small" variant="outlined" disabled={diagnosing || !tryUser.trim()}
              onClick={() => diagnose(tryUser.trim())}
            >
              Test this sign-in
            </Button>
          </Stack>
        </Paper>
      )}
      {diag && (
        <Alert
          severity={diag.ok ? 'success' : 'error'}
          sx={{ mb: 2 }}
          onClose={() => setDiag(null)}
        >
          <Typography variant="body2" fontWeight={700} gutterBottom>
            {diag.ok ? 'Mailbox reachable — reading works.' : `Connection stops here: ${diag.reason}`}
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
            {(diag.steps || []).map((st) => (
              <Box component="li" key={st.name} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 0.5 }}>
                {st.ok
                  ? <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981', mt: '2px' }} />
                  : <CancelIcon sx={{ fontSize: 16, color: '#ef4444', mt: '2px' }} />}
                <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>
                  <strong>{st.name}</strong> — {st.detail}
                </Typography>
              </Box>
            ))}
          </Box>
        </Alert>
      )}
      {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice(null)}>{notice}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '360px 1fr' }, gap: 2 }}>
        <Paper variant="outlined" sx={{ maxHeight: 640, overflow: 'auto' }}>
          {loading && <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>}
          {!loading && !messages.length && (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {notConfigured ? 'Connect the mailbox to see messages.' : 'No messages in this folder.'}
              </Typography>
            </Box>
          )}
          <List dense disablePadding>
            {messages.map((m) => (
              <React.Fragment key={m.uid}>
                <ListItemButton selected={selected?.uid === m.uid} onClick={() => open(m)} sx={{ alignItems: 'flex-start' }}>
                  <ListItemText
                    primaryTypographyProps={{ noWrap: true, fontWeight: m.seen ? 400 : 700, fontSize: 14 }}
                    secondaryTypographyProps={{ noWrap: true, fontSize: 12 }}
                    primary={m.subject}
                    secondary={`${m.fromName || m.fromEmail} · ${whenever(m.date)}`}
                  />
                  {!m.seen && <MarkEmailUnreadIcon sx={{ fontSize: 16, color: '#10b981', mt: 0.5 }} />}
                </ListItemButton>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, minHeight: 320, maxHeight: 640, overflow: 'auto' }}>
          {reading && <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress size={26} /></Box>}
          {!reading && !selected && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
              Select a message to read it.
            </Typography>
          )}
          {!reading && selected && (
            <Box>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={700}>{selected.subject}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{selected.fromName || selected.fromEmail}</strong>
                    {selected.fromEmail && selected.fromName ? ` <${selected.fromEmail}>` : ''}
                    {' · '}{selected.date ? new Date(selected.date).toLocaleString() : ''}
                  </Typography>
                  {selected.to?.length > 0 && (
                    <Typography variant="caption" color="text.secondary">to {selected.to.join(', ')}</Typography>
                  )}
                </Box>
                <Button size="small" variant="outlined" startIcon={<ReplyIcon />} onClick={() => replyTo(selected)}>
                  Reply
                </Button>
              </Stack>

              {selected.attachments?.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  {selected.attachments.map((a, i) => (
                    <Chip key={i} size="small" variant="outlined"
                      label={`${a.filename || 'attachment'} (${Math.round((a.size || 0) / 1024)}KB)`} />
                  ))}
                </Stack>
              )}

              <Divider sx={{ my: 2 }} />
              <Typography
                variant="body2"
                sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}
              >
                {selected.text || '(no plain-text body)'}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      <Dialog open={Boolean(compose)} onClose={() => !sending && setCompose(null)} fullWidth maxWidth="sm">
        <DialogTitle>{compose?.inReplyTo ? 'Reply' : 'New message'}</DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="text.secondary">
            From: SoldiKeeper Support &lt;support@soldikeeper.com&gt;
          </Typography>
          <TextField
            fullWidth margin="dense" label="To" value={compose?.to || ''}
            onChange={(e) => setCompose((c) => ({ ...c, to: e.target.value }))}
          />
          <TextField
            fullWidth margin="dense" label="Subject" value={compose?.subject || ''}
            onChange={(e) => setCompose((c) => ({ ...c, subject: e.target.value }))}
          />
          <TextField
            fullWidth margin="dense" label="Message" multiline minRows={10}
            value={compose?.text || ''}
            onChange={(e) => setCompose((c) => ({ ...c, text: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompose(null)} disabled={sending}>Cancel</Button>
          <Button
            variant="contained" startIcon={<SendIcon />} onClick={send}
            disabled={sending || !compose?.to || !compose?.subject}
          >
            {sending ? 'Sending…' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
