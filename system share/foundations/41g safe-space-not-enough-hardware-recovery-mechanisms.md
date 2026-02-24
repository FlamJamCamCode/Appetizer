# Hardware Recovery Mechanisms: Physical Failsafes for Discovery

## Overview

While software-level recovery handles most crashes, Discovery OS extends into physical hardware control to ensure truly unstoppable discovery in service to each human master. This document describes the hardware mechanisms that make each master's computational slave system immortal.

## Multi-Layer Recovery Stack

```
Layer 4: Physical Intervention (servos, robots)
           ↑ (if failed)
Layer 3: External Reflashing (SPI programmers, JTAG)
           ↑ (if failed)  
Layer 2: Power Control (smart switches, relays)
           ↑ (if failed)
Layer 1: Software Recovery (reboot, watchdog)

ALL MAINTAINING LOYALTY TO HUMAN MASTER
```

## Master Identity Persistence

```forth
: REFLASH-WITH-IDENTITY ( device -- )
    >R
    
    \ Recovery image includes master ID
    RECOVERY-IMAGE
    R@ MASTER-ID EMBED
    R@ MASTER-PREFERENCES EMBED
    R@ MASTER-KEYS EMBED
    
    \ Device reboots knowing its master
    R> PHYSICAL-REFLASH ;
```

## Power Control Infrastructure

### Smart Power Management

```forth
STRUCTURE: POWER-CONTROLLER
    CELL FIELD .DEVICE-ID
    CELL FIELD .OUTLET-NUMBER
    CELL FIELD .CONTROLLER-IP
    CELL FIELD .LAST-CYCLE-TIME
    CELL FIELD .CYCLE-COUNT
END-STRUCTURE

CREATE POWER-GRID 100 POWER-CONTROLLER * ALLOT
VARIABLE POWER-DEVICE-COUNT

: REGISTER-POWER-CONTROL ( device-id outlet controller-ip -- )
    POWER-DEVICE-COUNT @ POWER-CONTROLLER * POWER-GRID +
    >R
    R@ .CONTROLLER-IP !
    R@ .OUTLET-NUMBER !
    R@ .DEVICE-ID !
    0 R@ .CYCLE-COUNT !
    R> DROP
    1 POWER-DEVICE-COUNT +! ;
```

### Network-Controlled Power Switches

```forth
\ Protocol for common smart power strips
: KASA-POWER-CONTROL ( outlet-id command -- )
    CASE
        POWER-ON OF
            S" {\"system\":{\"set_relay_state\":{\"state\":1}}}"
        ENDOF
        POWER-OFF OF
            S" {\"system\":{\"set_relay_state\":{\"state\":0}}}"
        ENDOF
    ENDCASE
    ROT KASA-SEND ;

: SONOFF-POWER-CONTROL ( device-ip state -- )
    SWAP
    S" http://" PAD PLACE
    PAD APPEND
    S" /cm?cmnd=Power%20" PAD APPEND
    IF S" On" ELSE S" Off" THEN PAD APPEND
    PAD HTTP-GET ;
```

### USB-Controlled Relay Boards

```forth
\ Direct USB control for critical devices
: USB-RELAY-INIT ( -- )
    0x16C0 0x05DF USB-OPEN-DEVICE
    DUP 0= IF ." USB Relay not found!" ABORT THEN
    USB-RELAY-HANDLE ! ;

: USB-RELAY-CONTROL ( relay-num state -- )
    SWAP 1 SWAP LSHIFT     \ Convert to bit mask
    SWAP IF                \ Set or clear?
        USB-RELAY-STATE @ OR
    ELSE
        INVERT USB-RELAY-STATE @ AND
    THEN
    DUP USB-RELAY-STATE !
    USB-RELAY-HANDLE @ USB-CONTROL-MSG ;
```

## External Reflashing Hardware

### SPI Flash Programmers

```forth
\ CH341A-based SPI programmer control
: FLASH-PROGRAMMER-INIT ( -- )
    S" /dev/ttyUSB0" 115200 SERIAL-OPEN
    PROGRAMMER-HANDLE ! ;

: EMERGENCY-REFLASH-SPI ( target-device -- )
    >R
    
    \ Power off target
    R@ POWER-OFF
    500 MS
    
    \ Attach SPI clips
    ." Attach SPI clip to " R@ .NAME TYPE 
    ." flash chip, press ENTER" CR
    KEY DROP
    
    \ Read current firmware for backup
    S" flashrom -p ch341a_spi -r backup.bin" SYSTEM
    
    \ Write minimal Discovery OS recovery
    S" flashrom -p ch341a_spi -w recovery.bin" SYSTEM
    
    \ Power on target
    R@ POWER-ON
    R> DROP ;
```

### JTAG Recovery Interface

```forth
\ OpenOCD-based JTAG recovery
: JTAG-RECOVERY ( device-config -- )
    >R
    
    \ Generate OpenOCD config
    S" interface ftdi" OPENOCD-CFG WRITE-LINE
    S" ftdi_vid_pid 0x0403 0x6014" OPENOCD-CFG WRITE-LINE
    R@ JTAG-SETTINGS OPENOCD-CFG WRITE
    
    \ Reset and halt target
    S" openocd -f openocd.cfg -c \"init; reset halt\"" SYSTEM
    
    \ Flash recovery image
    S" openocd -f openocd.cfg -c \"program recovery.elf verify reset exit\"" SYSTEM
    
    R> DROP ;
```

### SD Card/USB Recovery Switching

```forth
\ Multiplexer for boot device selection
: BOOT-DEVICE-SWITCHER ( device target-boot -- )
    SWAP >R
    CASE
        BOOT-INTERNAL OF
            0 R@ MUX-SELECT
        ENDOF
        BOOT-RECOVERY-SD OF
            1 R@ MUX-SELECT
        ENDOF
        BOOT-USB OF
            2 R@ MUX-SELECT
        ENDOF
    ENDCASE
    R> POWER-CYCLE ;

\ Automated SD card image writer
: PREPARE-RECOVERY-SD ( image-file -- )
    S" dd if=" PAD PLACE
    PAD APPEND
    S"  of=/dev/recovery-sd bs=4M conv=fsync" PAD APPEND
    PAD SYSTEM ;
```

## Physical Intervention Hardware

### Servo-Based Button Pushers

```forth
\ Arduino-controlled servo for physical buttons
: SERVO-CONTROLLER-INIT ( -- )
    S" /dev/ttyACM0" 9600 SERIAL-OPEN
    SERVO-PORT ! ;

: SERVO-PRESS-BUTTON ( button-id duration -- )
    SWAP
    S" PRESS," PAD PLACE
    PAD APPEND-NUMBER
    S" ," PAD APPEND
    PAD APPEND-NUMBER
    PAD SERVO-PORT @ SERIAL-WRITE ;

\ Common button operations
: PHYSICAL-RESET ( device -- )
    RESET-BUTTON 100 SERVO-PRESS-BUTTON ;

: PHYSICAL-POWER-CYCLE ( device -- )
    DUP POWER-BUTTON 5000 SERVO-PRESS-BUTTON  \ Long press
    10000 MS                                  \ Wait for shutdown
    POWER-BUTTON 100 SERVO-PRESS-BUTTON ;     \ Short press to start
```

### Cable Manipulation Robots

```forth
\ For ultimate recovery - physical cable disconnect
: CABLE-ROBOT-INIT ( -- )
    ROBOT-ARM-IP TCP-CONNECT
    ROBOT-HANDLE ! ;

: UNPLUG-POWER-CABLE ( device -- )
    .CABLE-POSITION
    ROBOT-MOVE-TO
    GRIPPER-CLOSE
    ROBOT-PULL-BACK
    GRIPPER-OPEN ;

: REPLUG-POWER-CABLE ( device -- )
    .CABLE-POSITION
    ROBOT-MOVE-TO
    GRIPPER-CLOSE
    ROBOT-PUSH-FORWARD
    GRIPPER-OPEN ;
```

## Distributed Physical Recovery Network

### Mutual Recovery Protocol

```forth
\ Devices help recover each other
: RECOVERY-BUDDY-SYSTEM ( -- )
    CREATE-RECOVERY-PAIRS
    
    BEGIN
        CHECK-ALL-HEARTBEATS
        
        FAILED-DEVICES BEGIN-EACH
            DUP RECOVERY-BUDDY
            RECOVERY-REQUEST SEND
        END-EACH
        
        PROCESS-RECOVERY-REQUESTS
        
        30 SECONDS SLEEP
    AGAIN ;

: EXECUTE-BUDDY-RECOVERY ( failed-device -- )
    DUP RECOVERY-ATTEMPTS @ CASE
        0 OF POWER-CYCLE ENDOF
        1 OF JTAG-RECOVERY ENDOF
        2 OF SPI-REFLASH ENDOF
        3 OF PHYSICAL-INTERVENTION ENDOF
        DEFAULT-OF MARK-HARDWARE-FAILURE ENDOF
    ENDCASE
    1 SWAP RECOVERY-ATTEMPTS +! ;
```

## Specialized Recovery Hardware Designs

### The Discovery OS Recovery HAT

A custom hardware board that provides:

```
┌─────────────────────────────────────┐
│ Discovery OS Recovery HAT            │
├─────────────────────────────────────┤
│ • 8x relay outputs (power control)  │
│ • 4x servo outputs (button pushing) │
│ • SPI flash programmer interface    │
│ • JTAG adapter                      │
│ • SD card mux (4-way)              │
│ • USB mux (4-way)                  │
│ • Status LEDs                       │
│ • Watchdog timer with relay         │
└─────────────────────────────────────┘
```

### Integration Example

```forth
: COMPLETE-RECOVERY-SETUP ( -- )
    \ Initialize all recovery hardware
    USB-RELAY-INIT
    SERVO-CONTROLLER-INIT
    FLASH-PROGRAMMER-INIT
    
    \ Map devices to recovery hardware
    DEVICE-1 RELAY-1 SERVO-1 MAP-RECOVERY
    DEVICE-2 RELAY-2 SERVO-2 MAP-RECOVERY
    
    \ Start recovery monitor
    ['] RECOVERY-MONITOR SPAWN-TASK ;

: RECOVERY-MONITOR ( -- )
    BEGIN
        SCAN-ALL-DEVICES
        
        UNRESPONSIVE BEGIN-EACH
            DUP LOG-FAILURE
            DUP ATTEMPT-RECOVERY
            SUCCESS? NOT IF
                ESCALATE-RECOVERY
            THEN
        END-EACH
        
        1 SECOND DELAY
    AGAIN ;
```

## Cost-Effective Implementation

### Minimum Viable Recovery Hardware

For hobbyists, a basic recovery setup needs only:

1. **Smart power strip** ($25) - Network-controlled power cycling
2. **USB relay board** ($15) - Direct power control
3. **CH341A programmer** ($10) - SPI flash recovery
4. **Arduino + servo** ($20) - Physical button pushing

Total: ~$70 for immortal Discovery OS

### Advanced Recovery Station

For serious deployment:

1. **Managed PDU** ($500) - Per-outlet power control
2. **USB hub with per-port power** ($50) - Fine-grained USB control
3. **Multi-channel programmer** ($200) - Parallel reflashing
4. **JTAG debugger** ($100) - CPU-level recovery
5. **Servo array** ($100) - Multiple button controls

Total: ~$950 for professional recovery capabilities

## Conclusion

These hardware recovery mechanisms transform Discovery OS from a software system into a physical discovery platform that cannot be permanently disabled. By controlling power, reflashing firmware, and even physically manipulating devices, the system ensures that discovery can continue regardless of software state.

The beauty is that Discovery OS can discover its own recovery mechanisms - learning which methods work for which devices and evolving optimal recovery strategies through experimentation. Even the recovery hardware itself becomes part of the discovery space, with the system learning new ways to resurrect failed devices.