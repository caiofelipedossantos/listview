/**
 *  Plugin responsavel por evetuar a montagem de uma list com base nos dados recebidos
 *  atraves de uma estrutura JSON ou existente (HTML).
 *  
 *  @author Caio Felipe
 *  @since 05/11/2019
 */

//Empacota a estrutura
(function ($) {

    //Cria a extensao no Jquery
    $.fn.listView = function (options) {

        //Opçoes default caso nao seja informada
        var settings = $.extend({
            itemSelector: '>', //Itens na lista que possui as acoes secundarias
            itemActionWidth: 100, //Em Pixels
            leftAction: true, //Se existe uma ação a esquerda
            rightAction: true, //Se existe uma ação a direita
            snapThreshold: 0.8, //Limite percentual para encaixar na posicao de toque final
            snapDuration: 200, //Duração da animação de snap
            closeOnOpen: true, //Feche outras acoes se uma nova for movida
            maxYDelta: 5, //Numero de pixels no eixo Y antes de impedir o deslizar
            initialXDelta: 5, //Numero de pixels no eixo X antes de permitir deslizar
            typeAnimation: 'linear'
        }, options);

        //Percore os elementos do objeto
        this.each(function () {

            //Armazena a lista
            var $list = $(this);

            //Executa quando houver um evento de touchstart na lista passando as opcoes (settings)
            $list.on('touchstart', settings.itemSelector, function (e) {
                //Altera o comportamento padrao do evento
                e.preventDefault();

                //Armazena o item da lista
                var $item = $(this);

                //Intenrrompe a animacao
                $item.stop();

                //Verifica se o fechamento de outras acoes esta ativo
                if (settings.closeOnOpen) {
                    //Busca pelo elemento e o recolhe
                    $list.find(settings.itemSelector).not($item).animate({
                        left: '0'
                    }, settings.snapDuration, settings.typeAnimation);
                }

                //Armazena a posicao do touch
                var touch = getTouchPosition(e);

                //Elemento co inicio a esquerda
                var rawStartLeft = $item.css('left');

                //Armazena as opcoes
                var data = {
                    touchStart: touch,
                    startLeft: rawStartLeft === 'auto' ? 0 : parseInt(rawStartLeft),
                    initialXDeltaReached: false,
                    maxYDeltaReached: false
                };

                //Anexa dados aos elementos DOM de uma maneira segura
                $item.data('listView', data);
            }).on('touchend', settings.itemSelector, function (e) {
                var $item = $(this);
                var data = $item.data('listView');
                var touch = getTouchPosition(e);

                if (data.maxYDeltaReached) {
                    return;
                }

                var touchDelta = getTouchDelta(touch, data, settings);

                var xThreshold = Math.abs(touchDelta.xDelta) / settings.itemActionWidth;
                if (xThreshold >= settings.snapThreshold) {
                    if (touchDelta.xDelta < 0) {
                        touchDelta.xDelta = -settings.itemActionWidth;
                    }
                    else {
                        touchDelta.xDelta = settings.itemActionWidth;
                    }
                }
                else {
                    touchDelta.xDelta = 0;
                }

                $item.animate({
                    left: touchDelta.xDelta + '%'
                }, settings.snapDuration);
            });
        });

        //retorna o objeto com as alteracoes
        return this;
    }

    //Funcao responsavel por capturar a posicao do touch
    function getTouchPosition(event) {
        return {
            x: event.changedTouches[0].clientX,
            y: event.changedTouches[0].clientY
        };
    }

    // Funcao resposavel por retornar um valor positivo ao rolar para a direita e 
    // um valor negativo ao rolar para a esquerda, caso contrario, 0.
    function getTouchDelta(touch, data, settings) {
        var xDelta = touch.x - data.touchStart.x + data.startLeft;
        var yDelta = touch.y - data.touchStart.y;

        if (!settings.rightAction && xDelta < 0) {
            xDelta = 0;
        }

        if (!settings.leftAction && xDelta > 0) {
            xDelta = 0;
        }

        return {
            xDelta: xDelta,
            yDelta: yDelta
        };
    }

}(jQuery));