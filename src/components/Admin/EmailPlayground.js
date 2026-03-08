import React, { useState, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, IconButton, Tooltip, Divider,
  Select, MenuItem, FormControl, InputLabel, Chip, Paper,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  ToggleButtonGroup, ToggleButton, Slider
} from '@mui/material';
import {
  ContentCopy, Code, Preview, Delete, ArrowUpward, ArrowDownward,
  Save, SmartButton
} from '@mui/icons-material';

// ─── Platform palette ────────────────────────────────────────────────────────
const PALETTE = [
  { label: 'Primary', value: '#1976d2' },
  { label: 'Dark',    value: '#1565c0' },
  { label: 'Light bg',value: '#e3f2fd' },
  { label: 'Success', value: '#2e7d32' },
  { label: 'Error',   value: '#d32f2f' },
  { label: 'White',   value: '#ffffff' },
  { label: 'Black',   value: '#212121' },
  { label: 'Grey',    value: '#616161' },
  { label: 'Silver',  value: '#9e9e9e' },
];

// ─── Block types ─────────────────────────────────────────────────────────────
const BLOCK_TYPES = [
  { type: 'heading',   label: 'Heading' },
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'button',    label: 'Button' },
  { type: 'pill',      label: 'Pill / Badge' },
  { type: 'divider',   label: 'Divider' },
  { type: 'checklist', label: 'Checklist item' },
  { type: 'spacer',    label: 'Spacer' },
  { type: 'image',     label: 'Image (URL)' },
];

// ─── Default block factories ──────────────────────────────────────────────────
const makeBlock = (type) => {
  const id = Date.now() + Math.random();
  switch (type) {
    case 'heading':   return { id, type, text: 'Your heading here', size: 24, color: '#212121', bold: true };
    case 'paragraph': return { id, type, text: 'Write your message here.', size: 15, color: '#424242' };
    case 'button':    return { id, type, text: 'Click here', url: 'https://soldikeeper.com', bgColor: '#1976d2', textColor: '#ffffff', fullWidth: false };
    case 'pill':      return { id, type, text: 'Tag', bgColor: '#e3f2fd', textColor: '#1565c0', borderColor: '#90caf9' };
    case 'divider':   return { id, type, color: '#e0e0e0' };
    case 'checklist': return { id, type, text: 'Feature or benefit', color: '#424242', checkColor: '#1976d2' };
    case 'spacer':    return { id, type, height: 16 };
    case 'image':     return { id, type, url: '', alt: '', maxWidth: '100%' };
    default:          return { id, type: 'paragraph', text: '' };
  }
};

// ─── HTML serialiser ─────────────────────────────────────────────────────────
const blockToHtml = (block) => {
  switch (block.type) {
    case 'heading':
      return `<h${block.size >= 22 ? 1 : 2} style="font-size:${block.size}px;font-weight:${block.bold ? 700 : 400};color:${block.color};line-height:1.25;margin:0 0 12px;letter-spacing:-0.3px;">${block.text}</h${block.size >= 22 ? 1 : 2}>`;
    case 'paragraph':
      return `<p style="font-size:${block.size}px;color:${block.color};line-height:1.7;margin:0 0 16px;">${block.text.replace(/\n/g, '<br/>')}</p>`;
    case 'button':
      if (block.fullWidth) {
        return `<table cellpadding="0" cellspacing="0" style="margin:0 0 16px;width:100%;">
  <tr><td><a href="${block.url}" style="display:block;background:${block.bgColor};color:${block.textColor};text-decoration:none;font-weight:600;font-size:14px;padding:13px 22px;border-radius:10px;text-align:center;">${block.text}</a></td></tr>
</table>`;
      }
      return `<table cellpadding="0" cellspacing="0" style="margin:0 0 16px;width:100%;">
  <tr><td><a href="${block.url}" style="display:block;background:${block.bgColor};color:${block.textColor};text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;border-radius:10px;text-align:center;">${block.text}</a></td></tr>
</table>`;
    case 'pill':
      return `<p style="margin:0 0 16px;"><span style="display:inline-block;font-size:13px;font-weight:500;color:${block.textColor};background:${block.bgColor};border:1px solid ${block.borderColor};border-radius:100px;padding:5px 14px;">${block.text}</span></p>`;
    case 'divider':
      return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;"><tr><td style="height:1px;background:${block.color};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
    case 'checklist':
      return `<p style="margin:0 0 8px;font-size:14px;color:${block.color};"><span style="color:${block.checkColor};font-weight:700;">&#10003;</span>&nbsp; ${block.text}</p>`;
    case 'spacer':
      return `<div style="height:${block.height}px;font-size:0;line-height:0;">&nbsp;</div>`;
    case 'image':
      if (!block.url) return '';
      // max-width !important ensures mobile email clients respect the constraint
      return `<p style="margin:0 0 16px;"><img src="${block.url}" alt="${block.alt}" style="max-width:${block.maxWidth};width:100%;height:auto;display:block;border-radius:8px;" /></p>`;
    default:
      return '';
  }
};

// Wraps blocks in a mobile-first responsive container.
// Email-safe: table-based outer shell, 100% width, max-width 600px centered.
const blocksToHtml = (blocks) => {
  const inner = blocks.map(blockToHtml).join('\n');
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
        <tr>
          <td style="padding:0 4px;">
${inner}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
};

// Full standalone HTML page with viewport meta — for web/copy-paste use.
const blocksToFullHtml = (blocks) => {
  const body = blocksToHtml(blocks);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SoldiKeeper Message</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #f5f5f5; }
    img { max-width: 100% !important; height: auto !important; }
    a { word-break: break-word; }
    @media (max-width: 480px) {
      td { padding-left: 8px !important; padding-right: 8px !important; }
    }
  </style>
</head>
<body>
${body}
</body>
</html>`;
};

// ─── Colour swatch picker ─────────────────────────────────────────────────────
const ColorSwatch = ({ value, onChange, label }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{label}</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
      {PALETTE.map(c => (
        <Tooltip key={c.value} title={c.label}>
          <Box
            onClick={() => onChange(c.value)}
            sx={{
              width: 22, height: 22, borderRadius: '50%', cursor: 'pointer',
              bgcolor: c.value, border: value === c.value ? '2px solid #1976d2' : '1px solid #bdbdbd',
              boxShadow: value === c.value ? '0 0 0 2px #90caf9' : 'none',
              transition: 'all 0.15s',
            }}
          />
        </Tooltip>
      ))}
      <Tooltip title="Custom colour">
        <Box sx={{ position: 'relative', width: 22, height: 22 }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
            style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
          <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: value, border: '1px dashed #bdbdbd', pointerEvents: 'none' }} />
        </Box>
      </Tooltip>
    </Box>
  </Box>
);

// ─── Per-block editor panel ───────────────────────────────────────────────────
const BlockEditor = ({ block, onChange }) => {
  const set = (key, val) => onChange({ ...block, [key]: val });
  const commonText = (
    <TextField fullWidth size="small" label="Text" value={block.text} multiline
      onChange={e => set('text', e.target.value)} sx={{ mb: 1.5 }} />
  );

  switch (block.type) {
    case 'heading':
      return (
        <Box>
          {commonText}
          <Box sx={{ display: 'flex', gap: 2, mb: 1.5, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>Size: {block.size}px</Typography>
            <Slider min={18} max={36} value={block.size} onChange={(_, v) => set('size', v)} sx={{ flex: 1 }} />
          </Box>
          <ColorSwatch value={block.color} onChange={v => set('color', v)} label="Colour" />
        </Box>
      );
    case 'paragraph':
      return (
        <Box>
          {commonText}
          <Box sx={{ display: 'flex', gap: 2, mb: 1.5, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>Size: {block.size}px</Typography>
            <Slider min={12} max={20} value={block.size} onChange={(_, v) => set('size', v)} sx={{ flex: 1 }} />
          </Box>
          <ColorSwatch value={block.color} onChange={v => set('color', v)} label="Colour" />
        </Box>
      );
    case 'button':
      return (
        <Box>
          {commonText}
          <TextField fullWidth size="small" label="URL" value={block.url} sx={{ mb: 1.5 }}
            onChange={e => set('url', e.target.value)} />
          <ColorSwatch value={block.bgColor} onChange={v => set('bgColor', v)} label="Button colour" />
          <Box sx={{ mt: 1 }}>
            <ColorSwatch value={block.textColor} onChange={v => set('textColor', v)} label="Text colour" />
          </Box>
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <input type="checkbox" id={`fw-${block.id}`} checked={block.fullWidth} onChange={e => set('fullWidth', e.target.checked)} />
            <label htmlFor={`fw-${block.id}`}><Typography variant="caption">Full-width button</Typography></label>
          </Box>
        </Box>
      );
    case 'pill':
      return (
        <Box>
          {commonText}
          <ColorSwatch value={block.bgColor} onChange={v => set('bgColor', v)} label="Background" />
          <Box sx={{ mt: 1 }}>
            <ColorSwatch value={block.textColor} onChange={v => set('textColor', v)} label="Text colour" />
          </Box>
          <Box sx={{ mt: 1 }}>
            <ColorSwatch value={block.borderColor} onChange={v => set('borderColor', v)} label="Border colour" />
          </Box>
        </Box>
      );
    case 'divider':
      return <ColorSwatch value={block.color} onChange={v => set('color', v)} label="Line colour" />;
    case 'checklist':
      return (
        <Box>
          {commonText}
          <ColorSwatch value={block.color} onChange={v => set('color', v)} label="Text colour" />
          <Box sx={{ mt: 1 }}>
            <ColorSwatch value={block.checkColor} onChange={v => set('checkColor', v)} label="Check mark colour" />
          </Box>
        </Box>
      );
    case 'spacer':
      return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>Height: {block.height}px</Typography>
          <Slider min={4} max={64} value={block.height} onChange={(_, v) => set('height', v)} sx={{ flex: 1 }} />
        </Box>
      );
    case 'image':
      return (
        <Box>
          <TextField fullWidth size="small" label="Image URL" value={block.url} sx={{ mb: 1.5 }}
            onChange={e => set('url', e.target.value)} />
          <TextField fullWidth size="small" label="Alt text" value={block.alt} sx={{ mb: 1.5 }}
            onChange={e => set('alt', e.target.value)} />
          <FormControl size="small" fullWidth>
            <InputLabel>Max width</InputLabel>
            <Select label="Max width" value={block.maxWidth} onChange={e => set('maxWidth', e.target.value)}>
              {['100%', '80%', '60%', '300px', '200px'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      );
    default:
      return null;
  }
};

// ─── Block label helper ───────────────────────────────────────────────────────
const BLOCK_LABELS = { heading:'Heading', paragraph:'Paragraph', button:'Button', pill:'Pill', divider:'Divider', checklist:'Checklist', spacer:'Spacer', image:'Image' };

// ─── Main Playground component ────────────────────────────────────────────────
const EmailPlayground = ({ onSaveAsTemplate }) => {
  const [blocks, setBlocks] = useState([
    makeBlock('heading'),
    makeBlock('paragraph'),
    makeBlock('button'),
  ]);
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState('split'); // 'split' | 'preview' | 'code'
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [saveDialog, setSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const html = blocksToHtml(blocks);
  const fullHtml = blocksToFullHtml(blocks);

  const addBlock = (type) => {
    const nb = makeBlock(type);
    setBlocks(prev => [...prev, nb]);
    setSelectedId(nb.id);
  };

  const updateBlock = useCallback((updated) => {
    setBlocks(prev => prev.map(b => b.id === updated.id ? updated : b));
  }, []);

  const deleteBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setSelectedId(null);
  };

  const moveBlock = (id, dir) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return next;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(html).then(() =>
      setSnack({ open: true, msg: 'Email snippet copied!', severity: 'success' })
    );
  };

  const copyFullHtml = () => {
    navigator.clipboard.writeText(fullHtml).then(() =>
      setSnack({ open: true, msg: 'Full HTML page copied (mobile-optimized)!', severity: 'success' })
    );
  };

  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) return;
    onSaveAsTemplate && onSaveAsTemplate({ name: templateName, html });
    setSaveDialog(false);
    setTemplateName('');
    setSnack({ open: true, msg: `Template "${templateName}" saved!`, severity: 'success' });
  };

  const selected = blocks.find(b => b.id === selectedId);

  return (
    <Box sx={{ height: '100%' }}>
      {/* ── Toolbar ── */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          {/* Block adders */}
          {BLOCK_TYPES.map(({ type, label }) => (
            <Chip key={type} label={`+ ${label}`} size="small" onClick={() => addBlock(type)}
              sx={{ cursor: 'pointer', fontWeight: 500 }} variant="outlined" color="primary" />
          ))}

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* View toggle */}
          <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, v) => v && setView(v)}>
            <ToggleButton value="split"><Tooltip title="Split view"><Code fontSize="small" /></Tooltip></ToggleButton>
            <ToggleButton value="preview"><Tooltip title="Preview only"><Preview fontSize="small" /></Tooltip></ToggleButton>
            <ToggleButton value="code"><Tooltip title="HTML code"><SmartButton fontSize="small" /></Tooltip></ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Button size="small" variant="outlined" startIcon={<ContentCopy />} onClick={copyHtml}>Copy Snippet</Button>
          <Button size="small" variant="outlined" startIcon={<ContentCopy />} onClick={copyFullHtml} color="secondary">Copy Full Page</Button>
          <Button size="small" variant="contained" startIcon={<Save />} onClick={() => setSaveDialog(true)}>Save as Template</Button>
        </Box>
      </Paper>

      {/* ── Main area ── */}
      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 320px)', minHeight: 500 }}>

        {/* Left: block list + editor (hidden in preview mode) */}
        {view !== 'preview' && view !== 'code' && (
          <Paper elevation={0} sx={{ width: 280, flexShrink: 0, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Blocks</Typography>
            {blocks.length === 0 && (
              <Typography variant="caption" color="text.secondary">Add blocks using the toolbar above.</Typography>
            )}
            {blocks.map((block, idx) => (
              <Paper key={block.id} elevation={0} onClick={() => setSelectedId(block.id)}
                sx={{
                  p: 1, cursor: 'pointer', border: '1px solid',
                  borderColor: selectedId === block.id ? 'primary.main' : 'divider',
                  borderRadius: 1.5, bgcolor: selectedId === block.id ? 'primary.50' : 'background.paper',
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" fontWeight={600}>{BLOCK_LABELS[block.type]}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.3 }}>
                    <Tooltip title="Move up"><span><IconButton size="small" disabled={idx === 0} onClick={e => { e.stopPropagation(); moveBlock(block.id, -1); }}><ArrowUpward sx={{ fontSize: 14 }} /></IconButton></span></Tooltip>
                    <Tooltip title="Move down"><span><IconButton size="small" disabled={idx === blocks.length - 1} onClick={e => { e.stopPropagation(); moveBlock(block.id, 1); }}><ArrowDownward sx={{ fontSize: 14 }} /></IconButton></span></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={e => { e.stopPropagation(); deleteBlock(block.id); }}><Delete sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                  </Box>
                </Box>
                {block.text && (
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 200 }}>
                    {block.text}
                  </Typography>
                )}
              </Paper>
            ))}

            {/* Selected block editor */}
            {selected && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" fontWeight={700}>Edit: {BLOCK_LABELS[selected.type]}</Typography>
                <BlockEditor block={selected} onChange={updateBlock} />
              </>
            )}
          </Paper>
        )}

        {/* Right: preview or code */}
        <Paper elevation={0} sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'auto', p: 2 }}>
          {view === 'code' ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>Generated HTML <Chip label="mobile-optimized" size="small" color="success" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} /></Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" startIcon={<ContentCopy />} onClick={copyHtml}>Snippet</Button>
                  <Button size="small" variant="contained" startIcon={<ContentCopy />} onClick={copyFullHtml}>Full Page</Button>
                </Box>
              </Box>
              <TextField
                fullWidth multiline value={fullHtml} InputProps={{ readOnly: true }}
                minRows={20}
                sx={{ fontFamily: 'monospace', fontSize: 12,
                  '& textarea': { fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5 } }}
              />
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: 'text.secondary' }}>
                Preview {view === 'split' && '— click a block on the left to edit'}
              </Typography>
              <Box
                sx={{ maxWidth: 600, mx: 'auto', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff' }}
                dangerouslySetInnerHTML={{ __html: html || '<p style="color:#9e9e9e;font-size:14px;">Add blocks to see a preview…</p>' }}
              />
            </Box>
          )}
        </Paper>
      </Box>

      {/* ── Save as template dialog ── */}
      <Dialog open={saveDialog} onClose={() => setSaveDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Save as Template</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Template name" value={templateName}
            onChange={e => setTemplateName(e.target.value)} sx={{ mt: 1 }}
            onKeyDown={e => e.key === 'Enter' && handleSaveAsTemplate()} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAsTemplate} disabled={!templateName.trim()}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailPlayground;
