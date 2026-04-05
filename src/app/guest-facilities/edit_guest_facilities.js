const fs = require('fs');
const path = 'e:/Github/staymanager/src/app/guest-facilities/page.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

lines = lines.filter(line => !line.includes('const guest = activeGuests.find(g => g.reservation_id === selectedGuestId)') && !line.includes('if (!guest) throw new Error("Guest not found")'));

let c = lines.join('\n');
c = c.replace(/guest_id:\s*guest\.guest_id,/g, 'guest_id: finalGuestId,');
c = c.replace(/reservation_id:\s*guest\.reservation_id,/g, 'reservation_id: finalReservationId,');
c = c.replace(/room_id:\s*guest\.room_id,/g, 'room_id: finalRoomId,');

// Also update the dropdown to conditionally hide it
c = c.replace(
  /<Label>Select Guest \/ Room \*<\/Label>\s*<Select value=\{selectedGuestId\} onValueChange=\{setSelectedGuestId\}>/,
  `<Label>Select Guest / Room *</Label>
              {isGuest ? (
                <div className="p-3 border rounded-md bg-muted text-sm flex items-center">
                  <div className="h-4 w-4 mr-2" />
                  {guestReservation.loading 
                    ? "Deteksi kamar aktif..." 
                    : guestReservation.error 
                      ? <span className="text-destructive">Gagal: {guestReservation.error}</span> 
                      : <span className="font-medium text-blue-600">Terdeteksi: Kamar {guestReservation.room_number}</span>}
                </div>
              ) : (
                <Select value={selectedGuestId} onValueChange={setSelectedGuestId}>`
);

// We need to add the closing `)}` for the Select UI if it's there? Yes, but it's simpler to do it with regex
c = c.replace(
  /<\/SelectContent>\s*<\/Select>/,
  `</SelectContent>
                </Select>
              )}`
);

// Update submit button disabled status
c = c.replace(
  /<Button onClick=\{handleSubmitOrder\} disabled=\{!selectedGuestId \|\| isSubmitting\}>/,
  `<Button onClick={handleSubmitOrder} disabled={(!selectedGuestId && !isGuest) || isSubmitting || (isGuest && guestReservation.error !== null)}>`
);

fs.writeFileSync(path, c);
console.log('Update success');
