const prep_time_all_tasks = [, 90, 90, , 150]; //preparation time for tasks 1,2,4, s
const ans_time_all_tasks = [, 90, 100, , 180];
//answer time for tasks 1,2,4, s

const prep_color = "#e74c3c"; //red
const ans_color = "#75b800"; //green

const play_symbol = "&#9658;";
const pause_symbol = "&#10073;&#10073;";

var prep_time = prep_time_all_tasks[1]; //initialize with the 1st task
var ans_time = ans_time_all_tasks[1]; //initialize with the 1st task

var timer_update_fnc = 0; //reference to the timer update function
var task_idx = 1; //task index: 1,2 or 4
var timer_status; // timer status: on or off
var timer_elapsed; // elapsed time since timer_start
var timer_start; //when timer started
var timer_total; //total time to countdown, s
var timer_mode; //'prep' or 'ans'
var old_time_string; //previous displayed time

var audio = new Audio(
  "buzzer.mp3"
);

function play_sound() {
  audio.play();
}

function task2_ticks_toggle(ticks_state) {
  //toggle ticks for task 4 answering
  const boxes = document.getElementsByClassName("task2-sep");
  for (const box of boxes) {
    box.style.visibility = ticks_state;
  }
}

function reset_timer() {
  //initialize timer in 'prep' mode
  clearInterval(timer_update_fnc); // stop timer
  timer_status = "off";

  document.getElementById("play-button").innerHTML = play_symbol;
  document.getElementById("progress").style.width = "100%";
  document.getElementById("progress").style.background = prep_color;
  document.getElementById("counter").innerHTML = get_time_string(prep_time);
  task2_ticks_toggle("hidden");
}

function get_time_string(s_time) {
  //convert time in seconds to minutes:seconds string
  let minutes = Math.floor((s_time % (1 * 60 * 60)) / (1 * 60));
  let seconds = Math.floor((s_time % (1 * 60)) / 1);
  return "0" + minutes + ":" + `${seconds >= 10 ? seconds : "0" + seconds}`;
}

function update_timer() {
  //automatically called to update timer
  timer_elapsed = Date.now() - timer_start;
  timer_elapsed = Math.floor(timer_elapsed / 1000); //to seconds
  let remaining = timer_total - timer_elapsed; //remaining time
  if (remaining < 0) {
    clearInterval(timer_update_fnc); //stop timer
    if (timer_mode == "prep") {
      play_sound();
      begin_answer(); //switch to tha answer mode
    } else {
      play_sound();
      if (document.getElementById("exam-mode").checked) {
        //exam mode - go to the next task
        if (task_idx == 1) {
          task(2);
        } else if (task_idx == 2) {
          task(4);
        }
      } else {
        reset_timer();
      }
    }
    return;
  }
  time_string = get_time_string(remaining); //seconds to time string
  if (time_string != old_time_string) {
    //update only if time string changed
    document.getElementById("counter").innerHTML = time_string;
    pb_width = Math.floor((remaining / timer_total) * 100); //update time field
    document.getElementById("progress").style.width = pb_width.toString() + "%"; //update progress bar
    if (
      task_idx == 2 &&
      timer_mode == "ans" &&
      [20, 40, 60, 80].includes(timer_elapsed)
    ) {
      //beep every 20s in the answer phase of task 2
      play_sound();
    }
  }
  old_time_string = time_string;
}

function run_timer(total, mode, pb_color) {
  timer_total = total;
  timer_mode = mode;

  timer_status = "on";

  document.getElementById("progress").style.width = "100%";
  document.getElementById("progress").style.background = pb_color;

  timer_start = Date.now();
  old_time_string = "--:--";
  timer_update_fnc = setInterval(update_timer, 100); //launch timer
}

function begin_preparation() {
  task2_ticks_toggle("hidden");
  run_timer(prep_time, "prep", prep_color);
}

function begin_answer() {
  document.getElementById("play-button").innerHTML = pause_symbol;
  if (task_idx == 2) {
    task2_ticks_toggle("visible");
  }
  run_timer(ans_time, "ans", ans_color);
}

function stop() {
  reset_timer(); //reset into the preparation mode
}

function play() {
  if (timer_status == "off") {
    //start new coundown
    document.getElementById("play-button").innerHTML = pause_symbol;
    begin_preparation();
  } else if (timer_status == "pause") {
    //unfreeze
    document.getElementById("play-button").innerHTML = pause_symbol;
    timer_status = "on";
    timer_start = Date.now() - timer_elapsed * 1000; //subtract elapsed time
    timer_update_fnc = setInterval(update_timer, 100);
  } else {
    //pause
    document.getElementById("play-button").innerHTML = play_symbol;
    clearInterval(timer_update_fnc); //stop timer
    timer_status = "pause"; //freezing mode
  }
}

function skip_preparation() {
  if (timer_mode == "prep" && timer_status != "off") {
    clearInterval(timer_update_fnc); //stop timer
    play_sound();
    begin_answer(); //switch to tha answer mode
  }
}

function task(called_task) {
  //run timer for the chose task
  task_idx = called_task;
  document.getElementById("title").innerHTML = "TASK " + task_idx;
  prep_time = prep_time_all_tasks[task_idx];
  ans_time = ans_time_all_tasks[task_idx];
  //disable the current task button and enable the others
  const timer_buttons = document.getElementsByClassName("timer-button");
  for (const timer_button of timer_buttons) {
    if (timer_button.id == "task_" + called_task) {
      timer_button.classList.add("disabled");
    } else {
      timer_button.classList.remove("disabled");
    }
  }
  stop();
  play();
}

window.onload = function () {
  if ("ontouchstart" in window) {
    ans_time_all_tasks[task_idx];
    //mobile devices

    //disable hover on buttons
    const timer_buttons = document.getElementsByClassName("timer-button");
    for (const timer_button of timer_buttons) {
      timer_button.classList.add("no-hover");
    }
    //show only description, hide timer
    document.getElementById("main-box").style.display = "none";
    document.getElementById("description").style.display = "block";
  } else {
    document.getElementById("run-timer_button").style.display = "none";
  }
  reset_timer(); //initialize on the 1st task
};

function show_timer() {
  //for mobile devices
  document.getElementById("main-box").style.display = "block";
  document.getElementById("run-timer_button").style.display = "none";
  document.getElementById("description").style.display = "none";
}