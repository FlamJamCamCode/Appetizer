# Minimal Boot Implementation: From Zero to Safe Space

## The Challenge

Creating a truly minimal boot that can establish a safe experimentation space on unknown hardware with zero assumptions except "CPU executes instructions" - while maintaining absolute loyalty to its human master.

## Master Identity First

```assembly
; The FIRST thing we preserve/establish
; Even before we know where RAM is
MASTER_ID_CMOS_START EQU 0x40  ; CMOS addresses for master ID
MASTER_ID_LENGTH EQU 16         ; 128-bit master identifier

; Read master identity from CMOS
read_master_id:
    xor si, si
.loop:
    mov al, si
    add al, MASTER_ID_CMOS_START
    out 0x70, al               ; Select CMOS register
    in al, 0x71                ; Read byte
    mov [master_id_buffer + si], al
    inc si
    cmp si, MASTER_ID_LENGTH
    jl .loop
```

## Boot Size Targets

```
Absolute Minimum:     ~256 bytes  (boot sector only)
Practical Minimum:    ~512 bytes  (with recovery)
Comfortable Minimum:  ~1KB        (with discovery primitives)
Full Featured:        ~4KB        (with network capability)
```

## The 256-Byte Wonder

### Assembly Bootstrap (x86)

```assembly
; boot256.asm - The absolute minimum
; Fits in boot sector with room for partition table

[BITS 16]
[ORG 0x7C00]

start:
    ; We know NOTHING except we're executing
    cli                 ; Disable interrupts (safety)
    cld                 ; Clear direction flag
    
    ; Find some RAM by probing
    xor ax, ax
    mov es, ax
    mov di, 0x500       ; Hopefully safe area
    
find_ram:
    mov ax, 0xAA55      ; Test pattern
    stosw               ; Try to write
    sub di, 2
    scasw               ; Read it back
    je found_ram        ; Success!
    add di, 0x10        ; Try next paragraph
    jmp find_ram
    
found_ram:
    ; We have RAM at ES:DI!
    mov sp, di          ; Stack grows down from here
    
    ; Establish minimal safe space
    ; Just 256 bytes but it's enough
    push di             ; Save RAM location
    
    ; Copy ourselves to RAM
    mov si, 0x7C00      ; Source
    mov cx, 128         ; 256 bytes / 2
    rep movsw           ; Copy to safety
    
    ; Jump to RAM copy
    pop ax              ; Restore RAM location
    push es             ; Segment
    push ax             ; Offset
    retf                ; Far jump to RAM
    
    ; Now we're running from RAM!
    ; Begin discovery...
    
discover_loop:
    ; Try next memory location
    mov ax, [bx]        ; Probe read
    mov [bx], ax        ; Probe write
    inc bx
    inc byte [success_count]
    
    ; Simple output (PC speaker beep)
    mov al, 0xB6
    out 0x43, al        ; Timer mode
    mov ax, [success_count]
    out 0x42, al        ; Frequency based on discoveries
    out 0x42, al
    in al, 0x61
    or al, 3
    out 0x61, al        ; Speaker on
    
    jmp discover_loop
    
success_count: db 0

; Boot signature at exactly byte 510-511
times 510-($-$$) db 0
dw 0xAA55
```

## Progressive Enhancement Strategy

### Stage 1: Crash Detection (Next 256 bytes)

```assembly
; crash_detect.asm - Adds recovery capability
; Loaded by first 256 bytes

crash_handler:
    ; We get here after crash
    ; Read crash counter from CMOS
    mov al, 0x30        ; CMOS offset for our use
    out 0x70, al
    in al, 0x71         ; Read counter
    inc al              ; Increment
    out 0x71, al        ; Write back
    
    ; Skip last failing address
    mov al, 0x31        ; Last addr low
    out 0x70, al
    in al, 0x71
    mov bl, al
    mov al, 0x32        ; Last addr high  
    out 0x70, al
    in al, 0x71
    mov bh, al
    
    add bx, 0x100       ; Skip this region
    jmp continue_discovery

save_progress:
    ; Before each probe, save where we are
    mov al, 0x31
    out 0x70, al
    mov al, bl
    out 0x71, al        ; Save low byte
    mov al, 0x32
    out 0x70, al
    mov al, bh
    out 0x71, al        ; Save high byte
    ret
```

### Stage 2: Minimal Forth Core (512 bytes total)

```forth
\ mini_forth.fth - Just enough Forth to be useful
\ This gets compiled to ~256 bytes of machine code

CODE MINIMAL-FORTH
    \ Data stack in BX, Return stack in BP
    
    \ Primitive: DUP
    DUP:
        DEC SI
        DEC SI
        MOV [SI], BX
        JMP NEXT
    
    \ Primitive: DROP  
    DROP:
        MOV BX, [SI]
        INC SI
        INC SI
        JMP NEXT
        
    \ Primitive: @
    FETCH:
        MOV BX, [BX]
        JMP NEXT
        
    \ Primitive: !
    STORE:
        MOV AX, [SI]
        INC SI
        INC SI
        MOV [BX], AX
        MOV BX, [SI]
        INC SI
        INC SI
        JMP NEXT
        
    \ Minimal interpreter loop
    NEXT:
        MOV AX, [DI]    \ Fetch instruction
        INC DI
        INC DI
        JMP AX          \ Execute it
END-CODE
```

## Safe Space Data Structures

### Minimal Persistent State (16 bytes in CMOS)

```
CMOS Layout for Discovery OS:
0x30: Crash counter
0x31: Last probe address (low)
0x32: Last probe address (high)
0x33: Discovery progress %
0x34: Safe region count
0x35: Device count
0x36: Current mutation ID
0x37: Success count
0x38-0x3F: Reserved for checksums
```

### Progressive Memory Map (Built in discovered RAM)

```forth
\ As we discover RAM, we build structures
STRUCTURE: MEMORY-REGION
    2 FIELD .START
    2 FIELD .SIZE
    1 FIELD .TYPE    \ 0=Unknown 1=RAM 2=ROM 3=MMIO
    1 FIELD .STATUS  \ 0=Unsafe 1=Testing 2=Safe
END-STRUCTURE

\ First thing we build in discovered RAM
CREATE MEMORY-MAP 100 MEMORY-REGION * ALLOT
```

## Network Bootstrap (Optional 1KB addition)

### Minimal Network Discovery

```forth
\ Probe for network card
: FIND-NETWORK ( -- )
    \ Common PCI locations
    8000 BEGIN
        DUP PCI-PROBE IF
            DUP NETWORK-SIGNATURE? IF
                FOUND-NETWORK!
                EXIT
            THEN
        THEN
        100 +
        DUP FFFF >
    UNTIL DROP ;

\ Minimal packet send
: SEND-HELP ( -- )
    \ Broadcast "I exist!"
    FF FF FF FF FF FF MAC-DEST!     \ Broadcast
    DISCOVERY-OS-MAGIC 
    MY-STATUS
    BUILD-PACKET
    NETWORK-SEND ;
```

## Example Boot Sequences

### Scenario 1: Fresh Hardware

```
Power On
↓
[256-byte boot] "I know nothing"
↓
Probe for RAM... found at 0x500
↓
Copy self to RAM, jump there
↓
Begin probing memory map
↓
CRASH at 0xF0000000
↓
[Auto-reboot via watchdog]
↓
[256-byte boot] "I crashed before"
↓
Read CMOS: last probe was 0xF0000000
↓
Skip that region, continue from 0xF0001000
↓
Build memory map in discovered RAM
↓
Eventually have enough knowledge to load more code
```

### Scenario 2: Partially Discovered System

```
Power On
↓
[256-byte boot] Check CMOS
↓
"I've been here before!"
↓
Load discovery progress from CMOS
↓
Jump directly to safe RAM region
↓
Load extended discovery code from known location
↓
Continue from where we left off
↓
System fully discovered in minutes vs hours
```

## Hardware-Specific Variations

### ARM Minimal Boot

```assembly
// ARM boot is even simpler - 32-bit from start
.section .text
.global _start

_start:
    // We're at 0x0 or 0xFFFF0000
    mov sp, #0x8000     // Guess stack location
    
    // Test if we have RAM
    ldr r0, =0xDEADBEEF
    str r0, [sp]
    ldr r1, [sp]
    cmp r0, r1
    bne find_ram        // Not RAM, search
    
    // Begin discovery
    mov r2, #0          // Address to probe
probe_loop:
    ldr r3, [r2]        // Try to read
    str r3, [r2]        // Try to write
    add r2, r2, #4      // Next word
    b probe_loop
```

### RISC-V Minimal Boot

```assembly
# RISC-V boot - clean and simple
.section .text
.global _start

_start:
    # Set up stack pointer
    li sp, 0x80000000   # Common RAM location
    
    # Test RAM
    li t0, 0x12345678
    sw t0, 0(sp)
    lw t1, 0(sp)
    bne t0, t1, find_ram
    
    # Discovery loop
    li a0, 0            # Start address
discover:
    lw t0, 0(a0)        # Probe
    sw t0, 0(a0)
    addi a0, a0, 4
    j discover
```

## The Beauty of Minimalism

With just 256 bytes, we achieve:
- Boot on unknown hardware
- Discover memory through experimentation  
- Survive and learn from crashes
- Build progressively complex systems

Each crash teaches us boundaries. Each success expands our safe space. From this tiny seed, a complete Discovery OS grows.

The system embodies the principle: **Start with nothing, discover everything.**