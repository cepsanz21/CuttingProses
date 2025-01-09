const registeredUsers = [
    { username: 'user1', password: 'password1', name: 'John Doe' },
    { username: 'user2', password: 'password2', name: 'Jane Smith' }
];

let timers = {}; // Menyimpan timer untuk setiap baris
let currentAction = ""; // Menyimpan aksi saat ini
let startTimes = {}; // Menyimpan waktu mulai untuk setiap aksi
let totalElapsedTime = {}; // Menyimpan total waktu untuk setiap aksi

document.getElementById('loginForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = registeredUsers.find(user => user.username === username && user.password === password);
    
    if (user) {
        localStorage.setItem('username', username);
        localStorage.setItem('name', user.name);
        window.location.href = 'dashboard.html';
    } else {
        alert('Username atau password salah!');
    }
});

if (window.location.pathname.endsWith('dashboard.html')) {

    const displayName = localStorage.getItem('name');
    document.getElementById('userName').innerText = displayName ? displayName : 'Guest';

    function updateTime() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false };
        document.getElementById('currentTime').innerText = now.toLocaleString('id-ID', options);
    }

    updateTime();
    setInterval(updateTime, 1000);

    // Menambahkan event listener untuk semua tombol
    document.querySelectorAll('.button-container button').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.innerText;

            const assy = document.getElementById('assy').value;
            const noCCT = document.getElementById('noCCT').value;
            const qty = document.getElementById('qty').value;

            if (["Start Proses", "Setting Mesin", "Problem Mesin", "Material Habis"].includes(action)) {
                if (assy && noCCT && qty) {
                    const tableBody = document.querySelector('#dataTable tbody');
                    const newRowIndex = tableBody.rows.length + 1;
                    const newRow = tableBody.insertRow();
                    newRow.innerHTML = `
                        <td>${newRowIndex}</td> 
                        <td>${assy}</td> 
                        <td>${noCCT}</td> 
                        <td>${qty}</td> 
                        <td>${action}</td> 
                        <td id="timer-${newRowIndex}">0:00</td>`;
                    
                    // Reset input fields after adding to table
                    document.getElementById('assy').value = '';
                    document.getElementById('noCCT').value = '';
                    document.getElementById('qty').value = '';

                    handleAction(action, newRowIndex);
                } else {
                    alert("Harap isi semua kolom!");
                }
            } else if (action === "Stop Proses") {
                stopAllProcesses();
            } else if (action === "Exit") {
                window.location.href = 'index.html';
            } else {
                stopTimer(currentAction); // Hentikan timer jika tombol lain ditekan
                handleAction(action, null); // Mulai aksi baru
            }
        });
    });

    function handleAction(action, rowIndex) {
        // Hentikan semua timer yang sedang berjalan
        stopAllProcesses();

        if (rowIndex !== null) {
            currentAction = action; // Set aksi saat ini
            startTimer(rowIndex); // Mulai timer untuk aksi baru
            
            // Inisialisasi total elapsed time jika belum ada
            if (!totalElapsedTime[action]) {
                totalElapsedTime[action] = 0;
            }
        }
    }

    function startTimer(rowIndex) {
        startTimes[rowIndex] = Date.now(); // Simpan waktu mulai
        timers[rowIndex] = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - startTimes[rowIndex]) / 1000);
            updateTimerDisplay(rowIndex, elapsedTime);
            
            // Update total elapsed time for the current action
            totalElapsedTime[currentAction] += 1; // Tambah 1 detik ke total elapsed time
            
            // Update the total time in the second table
            updateTotalTime(currentAction, totalElapsedTime[currentAction]);
            
        }, 1000);
    }

    function stopTimer(action) {
        for (const row in timers) {
            if (document.querySelector(`#dataTable tbody tr:nth-child(${row}) td:nth-child(5)`).innerText === action) {
                clearInterval(timers[row]);
                delete timers[row]; // Hapus timer dari objek setelah dihentikan
                break;
            }
        }
    }

    function updateTimerDisplay(rowIndex, elapsedTime) {
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        document.getElementById(`timer-${rowIndex}`).innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        // Tidak perlu memanggil addTotalAction di sini karena sudah ditangani dalam startTimer
    }

    function updateTotalTime(action, totalSeconds) {
        const totalTableBody = document.querySelector('#totalTimeTable tbody');
        
        let existingRow = Array.from(totalTableBody.rows).find(row => row.cells[0].innerText === action);
        
        if (existingRow) {
            existingRow.cells[1].innerText = formatTotalTime(totalSeconds); // Update existing row's total time
        } else {
            // Create a new row if it doesn't exist
            const newTotalRow = totalTableBody.insertRow();
            newTotalRow.innerHTML = `
                <td>${action}</td>
                <td>${formatTotalTime(totalSeconds)}</td>`;
        }
    }

    function stopAllProcesses() {
        for (const row in timers) {
            clearInterval(timers[row]); // Hentikan semua timer yang berjalan
            delete timers[row]; // Hapus dari objek timers
        }
    }

    function formatTotalTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function convertToSeconds(timeString) {
        const [minutes, seconds] = timeString.split(':').map(Number);
        return minutes * 60 + seconds;
    }
}
