const fs = require('fs');
const filepath = 'e:/Github/staymanager/src/app/api/reports/analytics/route.ts';

let content = fs.readFileSync(filepath, 'utf8');

const targetStr = `    let revenueQuery = supabase
      .from('invoices')
      .select(\`
        amount,
        status,
        created_at,
        reservations!inner(
          id,
          check_in,
          check_out,
          total_amount,
          guests_count,
          rooms!inner(
            number,
            type,
            base_price
          )
        )
      \`)
      .gte('created_at', startDate)
      .lte('created_at', endDate + ' 23:59:59')

    if (roomType !== 'all') {
      revenueQuery = revenueQuery.eq('reservations.rooms.type', roomType)
    }

    const { data: invoicesData, error: invoicesError } = await revenueQuery`;

// Using replace function with string matches exactly. However, due to LF/CRLF differences, we will use a more robust regex that ignores whitespace differences.
const regex = /let revenueQuery = supabase[\s\S]*?const \{ data: invoicesData, error: invoicesError \} = await revenueQuery/m;

const replacementStr = `    // Fetch all invoices for the date range
    let revenueQuery = supabase
      .from('invoices')
      .select(\`
        amount,
        status,
        created_at,
        reservation_id
      \`)
      .gte('created_at', startDate)
      .lte('created_at', endDate + ' 23:59:59')

    const { data: rawInvoicesData, error: invoicesError } = await revenueQuery

    let invoicesData = rawInvoicesData || []

    // If filtering by room type, fetch their reservations manually to filter invoices
    if (roomType !== 'all' && invoicesData.length > 0) {
      const { data: filteredRes, error: filteredResErr } = await supabase
        .from('reservations')
        .select('id, rooms!inner(type)')
        .eq('rooms.type', roomType)
        .in('id', invoicesData.map(i => i.reservation_id).filter(id => id != null))
        
      if (!filteredResErr && filteredRes) {
        const validResIds = new Set(filteredRes.map(r => r.id))
        invoicesData = invoicesData.filter(i => validResIds.has(i.reservation_id))
      }
    }`;

content = content.replace(regex, replacementStr);
fs.writeFileSync(filepath, content, 'utf8');
console.log("Analytics route fixed");
