$(document).ready(function(){
  const transitionTime = "750ms";
  const baseUrl = document.location.protocol+'//'+document.location.hostname;

  let audio = new Audio(baseUrl+'/assets-webbox/music/musik.mp3');
  audio.volume = 0.2
  audio.loop = true;
  audioPlay = false;

  var confettiElement = document.getElementById('my-canvas');
  var confettiSettings = { target: confettiElement };
  var confetti = new ConfettiGenerator(confettiSettings);
  confetti.render();

  let tmpItems;
  let c = 0;
  let isOpen = false;

  getBoxs();
  function getBoxs() {
    $.ajax({
      url: baseUrl+'/website/misterybox_boxs',
      type: 'get',
      contentType: 'application/json',
      success: function( data, textStatus, jQxhr ){
        var data = JSON.parse(data);
        tmpItems = data.items;
        createCube(data.boxs, data.items);
      },
      error: function( jqXhr, textStatus, errorThrown ){
        console.log(errorThrown);
      }
    });
  }

  $('#close-popup-ads').click(function(){
    $('#popup-ads').fadeOut(500);
  });

  $('#toggleAudio').click(function(){
    if (!audio.paused) {
      audio.pause();
      this.src = baseUrl+'/assets-webbox/img/volume-mute.png';
      audioPlay = false;
    }else{
      audio.play();
      this.src = baseUrl+'/assets-webbox/img/volume.png';
      audioPlay = true;
    }
  });

  $('#check-voucher').click(function(){
    var voucher = $('#voucher').val();
    if (voucher.length <= 0){
      $("#error_message_voucher").html("Kode Tiket tidak boleh kosong!");
      return;
    }

    $('#main-logo').fadeIn(500);
    check(voucher);
  });

  $('#show-prizes').click(function(){
    let cubes = $('.cubes');
    $('#welcome').fadeOut(500);
    $('#show-check-voucher').fadeIn(500);
    $('#main-logo').fadeIn(500);

    setTimeout(function(){
      for (var i = 0; i < cubes.length; i++)
        openCube(cubes[i], tmpItems[i]);
    }, 500);
  });

  $('#show-check-voucher').click(function(){
    closeBox();
    $('#show-check-voucher').fadeOut(500);
    $('#main-logo').fadeOut(500);

    setTimeout(function(){
      $('#welcome').fadeIn(500);
    }, 500);
  });

  $('#close-popup-winner').click(function(){
    if (audioPlay) {
      audio.src = baseUrl+'/assets-webbox/music/musik.mp3';
      audio.play();
    }

    $("#my-canvas").css("display", "none");
    $('#popup-prize-claim').fadeOut(500);
    $('#show-check-voucher').fadeIn(500);
  });

  function check(voucher_val){
    $("#error_message_voucher").html("Sedang memeriksa kode tiket..");
    $("#check-voucher").attr('disabled','disabled');
    $("#show-prizes").attr('disabled','disabled');

    $.ajax({
      url: baseUrl+'/website/misterybox_check/'+voucher_val,
      type: 'get',
      contentType: 'application/json',
      success: function( data, textStatus, jQxhr ){
        var data = JSON.parse(data);
        $("#error_message_voucher").html(data['message']);

        if (data['code'] == 200){
          openBox(data.item_winner, data.items);
          $('#welcome').fadeOut(500);
        }

        $("#check-voucher").removeAttr('disabled');
        $("#show-prizes").removeAttr('disabled');
      },
      error: function( jqXhr, textStatus, errorThrown ){
          console.log(errorThrown);
      }
    });
  }

  function getItemById(items, item_id) {
    for (var i = 0; i < items.length; i++)
      if (items[i].id == item_id)
        return items[i];
  }

  function closeBox(){
    let cubes = $('.cubes');
    for (var i = 0; i < cubes.length; i++)
      closeCube(cubes[i]);
  }

  function openBox(winner_item, items) {
    let isWinOpened = true;
    let itemOpened = [];
    $('.cubes').click(function(){
      if (isWinOpened) {
        openCube(this, getItemById(items, winner_item.item_id));
        isWinOpened = false;
        itemOpened.push(winner_item.item_id);
      }

      setTimeout(function(){
        let cubes = $('.cubes');
        for (var i = 0; i < cubes.length; i++) {
          if (!cubes[i].isOpen){
            var index;
            for (var j = 0; j < items.length; j++) {
              if (!itemOpened.includes(items[j].id)){
                index = j;
                itemOpened.push(items[j].id);
                j = items.length;
              }
            }

            openCube(cubes[i], items[index]);
          }
        }

        showWinner(winner_item);
      }, 1000);
    });
  }

  function showWinner(winner_item){
    $('.img-prize').attr('src', winner_item.item_image);
    $('.message-claim').html(winner_item.item_description);
    $('#voucher-username').html(winner_item.username);
    $('#voucher-voucher').html(winner_item.voucher);
    $('#head-value').html('<b>'+winner_item.item_name+'</b>');

    var claim_message = winner_item.claim_message;
    claim_message = claim_message.replaceAll('{{username}}', winner_item.username);
    claim_message = claim_message.replaceAll('{{voucher}}', winner_item.voucher);
    claim_message = claim_message.replaceAll('{{item_name}}', winner_item.item_name);
    claim_message = claim_message.replaceAll('{{item_value}}', winner_item.item_value);

    var link_claim = "https://wa.me/"+winner_item.no_whatsapp+"?text="+claim_message;
    $("#link_claim").attr('href', link_claim);

    setTimeout(function(){
      if (audioPlay) {
        audio.src = baseUrl+'/assets-webbox/music/congrats.mp3';
        audio.play();
      }

      $('#popup-prize-claim').fadeIn(500);
      $("#my-canvas").css("display", "block");
    }, 1000);
  }

  $('#show-history').click(function(){
    getHistory()
  });

  $('#close-popup-history').click(function(){
    $("#popup-history").fadeOut(500);
  });

  function getHistory(){
    $("#error_message_voucher").html("Mohon Tunggu...");

    $("#show-history").attr('disabled','disabled');
    $.ajax({
      url: baseUrl+'/website/misterybox_history',
      type: 'get',
      contentType: 'application/json',
      success: function( data, textStatus, jQxhr ){
        var data = JSON.parse(data);
        $("#error_message_voucher").html("");
        $("#history-container").html("");

        var str = '';
        for (var i = 0; i < data.length; i++) {
          str += '<tr>'+
                    '<td style="width: 10%; padding: 5px; text-align: center;">'+data[i]['no']+'</td>'+
                    '<td style="width: 50%; padding: 5px;">'+data[i]['username']+'</td>'+
                    '<td style="width: 40%; padding: 5px; text-align: center;">'+data[i]['value']+'</td>'+
                  '</tr>';
        }

        $("#show-history").removeAttr('disabled');
        $("#history-container").html(str);
        $("#popup-history").fadeIn(500);
      },
      error: function( jqXhr, textStatus, errorThrown ){
          console.log(errorThrown);
      }
    });
  }

  function createCube(boxs, items) {
    for (var i = 0; i < items.length; i++) {
      let cubeHtml = '<div id="cube" class="cubes h-40 w-40 relative flex justify-center items-center cursor-pointer float-left" style="transition: all 750ms ease 0s; animation-play-state: running; opacity: 1;">'+
                        '<div class="cube back h-40 w-40 absolute top-0 left-0" style="transition: all 750ms ease 0s; background-image: url(\''+(baseUrl+'/'+boxs['image_box_back'])+'\'); opacity: 1;"></div>'+
                        '<div class="cube top h-40 w-40 absolute top-0 left-0" style="transition: all 750ms ease 0s; background-image: url(\''+(baseUrl+'/'+boxs['image_box_top'])+'\');  transform: translateY(0px); opacity: 1;"></div>'+
                        '<div class="cube left h-40 w-40 absolute top-0 left-0" style="transition: all 750ms ease 0s; background-image: url(\''+(baseUrl+'/'+boxs['image_box_left'])+'\'); transform: translateX(0px); opacity: 1;"></div>'+
                        '<div class="cube right h-40 w-40 absolute top-0 left-0" style="transition: all 750ms ease 0s; background-image: url(\''+(baseUrl+'/'+boxs['image_box_right'])+'\'); transform: translateX(0px); opacity: 1;"></div>'+
                        '<div class="powerup absolute" style="transition: all 750ms ease 0s; background-image: url(\''+(baseUrl+('/'+items[i]['image']))+'\'); opacity: 0; z-index: 0; height: 48px; width: auto;"></div>'+
                      '</div>';
      $('#cube-container').append(cubeHtml);
    }
  }

  function openCube(this_element, item) {
    const cback = this_element.querySelector(".back");
    const ctop = this_element.querySelector(".top");
    const cleft = this_element.querySelector(".left");
    const cright = this_element.querySelector(".right");
    const glow = this_element.querySelector(".hexagon");
    const powerup = this_element.querySelector(".powerup");

    if (!this_element.isOpen) {
      powerup.style.backgroundImage = "url('"+item.image+"')";
      ctop.style.transform = "translateY(-3rem)";
      cleft.style.transform = "translateX(-3rem)";
      cright.style.transform = "translateX(3rem)";
      ctop.style.opacity = 0.8;
      cleft.style.opacity = 0.8;
      cright.style.opacity = 0.8;
      cback.style.opacity = 0.8;
      powerup.style.opacity = 1;
      this_element.isOpen = true;
      this_element.item_id = item.id;
      this_element.style.animationPlayState = "paused";
      powerup.style.zIndex = 10;
      powerup.style.height = "80px";
      powerup.style.width = "";
    }
  }

  function closeCube(this_element){
    const cback = this_element.querySelector(".back");
    const ctop = this_element.querySelector(".top");
    const cleft = this_element.querySelector(".left");
    const cright = this_element.querySelector(".right");
    const glow = this_element.querySelector(".hexagon");
    const powerup = this_element.querySelector(".powerup");

    if (this_element.isOpen) {
      ctop.style.transform = "translateY(0)";
      cleft.style.transform = "translateX(0)";
      cright.style.transform = "translateX(0)";
      this_element.style.opacity = 1;
      this_element.isOpen = false;
      ctop.style.opacity = 1;
      cleft.style.opacity = 1;
      cright.style.opacity = 1;
      cback.style.opacity = 1;
      powerup.style.opacity = 0;
      powerup.style.zIndex = 0;
      this_element.style.animationPlayState = "running";
      powerup.style.height = "48px";
      powerup.style.width = "48px";
    }
  }
});
