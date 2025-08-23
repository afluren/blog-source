---
title: Javascript异步
date: 2025-02-10 16:20:23
categories: 
- 前端
tags: 
- Javascript
- 异步
katex: true
---
	这里介绍的异步是比较现代的Promise，async、await关键字，并不探讨古早的异步API

## 异步
---
异步是和同步相对比的概念。一般的代码执行流程是从上到下一行行执行，只有上一行正确执行了才会到下一行，这就是**同步**的执行流程。
这样的流程虽然思路清晰直接，但是如果某一行代码执行时间比较长，就需要等待较长时间，而[浏览器大部分情况下又是单线程执行](https://developer.mozilla.org/zh-CN/docs/Web/Performance/How_browsers_work)，就是说它会一股脑执行完你的同步代码逻辑，你的同步逻辑没执行完它没办法执行其他逻辑，反映到浏览器上就是浏览器卡了，然后堵塞在事件队列里的事件一口气执行。所以，我们需要**异步**。
异步会将这些事件放置在事件队列中和主事件同步执行，然后在异步操作完成后再执行相关逻辑，这样的话就可以在等待异步操作完成的同时不影响浏览器的正常渲染，不会阻塞主进程。

但是如果异步没有按规范使用，比如在同步逻辑中使用异步操作的返回值，就有可能导致无法正确读取到返回值导致报错（因为你同步逻辑是正常执行的，而当时异步操作可能没有执行完成，比如常见的进行网络请求的`fetch`操作，就是异步的）

下面我们就详细介绍一下异步所涉及的概念和使用方法，正确使用异步函数和创建自己的异步函数。

## Promise
---
一个异步操作它会有不同的状态，比如正在执行，正确执行，执行失败等，为了表示这种状态，异步函数会返回一种叫作**Promise**的对象，里面告诉了我们不同状态下这个异步操作的返回值以及相应的状态，我们便可以根据Promise编写不同状态下使用相应返回值的处理逻辑。
Promise有三种状态：
+ **待定（pending）**，表示操作执行中，也没有什么特别的逻辑
+ **已兑现（fulfilled）**，表示该操作正确执行，后续会调用`then()`处理函数
+ **已拒绝（rejected）**，表示该操作执行失败，后续会调用`catch()`处理函数

上文中提到的`then()`和`catch()`函数是Promise对象的方法，写明了上述情况下该执行的逻辑，比如使用`fetch()`返回一个Promise对象后，我们就可以对这个对象编写相应的逻辑：
```javascript
fecth('https://example.com')
.then((res)=>{
	//res便是我们正确请求的数据，在这里编写正确返回数据的逻辑
})
.catch((err)=>{
	//err便是请求错误得到的错误，在这里编写请求错误相关的逻辑
})
```
>至于到底什么样的状态才算是正确执行或者执行失败，看的是这个**异步函数的规定**，而不是你认为的正确或者失败。比如上面我们使用的`fetch()`，只对因为网络错误或者URL格式错误等导致的**请求失败**才认为执行失败，而对于服务器返回404、504之类的错误状态，也认为是**请求成功**

注意到，我们在`then()`后面紧跟了一个`catch()`，它们都能处理`fecth()`返回的Promise，原因在于`then()`和`catch()`自己的返回值也是一个Promise，可以写成这样的链式代码，逻辑更清晰。
#### 编写自己的异步函数
---
有时候我们想封装一些异步操作，就需要编写一个自定义的异步函数。而一个函数是否是异步函数，根据就是**它的返回值是否是Promise对象。**
那么该怎么返回一个Promise对象呢？我们就需要按照Promise对象的规范去自己构造一个Promise对象用于返回。比如：
```javascript
function myFunction(){
	return new Promise((resolve,reject)=>{
		if(1>2){
			resolve("正确");
		}
		reject("错误");
	})
}
```
可以看到，通过`new`关键字创建一个Promise对象，然后它接受一个函数作为参数。这个函数接受两个函数参数`resolve`和`reject`，前者的作用是输出异步操作正确执行的返回值，后者的作用是输出异步操作错误执行的返回值。而这些返回值会在`then()`和`catch()`函数中被相应的捕捉到。
### async，await
---
想要编写自己的异步函数，就需要函数的返回值是一个Promise对象。作者作者，你的手写Promise确实很强，但还是太吃熟练度了，有没有更加简单又强势的方法推荐一下？有的兄弟，有的。`async`关键字可以很便捷地创建一个异步函数。
它的作用是，在函数前声明`async`关键字，它便会自动将你的`return`值转变为`resolve`的值，`throw`的错误转变为`reject`的值。然后浏览器也就会认为这个函数是异步函数。
```javascript
async function myFunction(){
	if(1>2){
		return "你好！" //等同于return Promise.resolve("你好！")
	}
	throw new Error("你不好！")//等同于return Promise.reject(new Error("你不好！"))
	
}
```
这样就可以了！

而且在声明了`async`的函数中，可以使用`await`关键字，它的作用是直接返回一个Promise所返回的值。并且它可以堵塞声明了`async`的函数，使被`await`装饰了的异步函数执行之后再继续整个函数，例如：
```javascript
function myFunction(){
	return new Promise((resolve,reject)=>{
		if(1>2){
			resolve("正确");
		}
		reject("错误");
	})
}

async function main(){
	const value=await myFunction();
	console.log(value);//输出："错误"
}
main();
```
我们和不使用`await`做一个对比：
```javascript
async function main2(){
	myFunction()
	.then((res)=>{
		console.log(res);
	})
	.catch((err)=>{
		console.log(err);//输出："错误"
	})
}
main2();
```
它相当于直接获取了Promise执行完成后的返回值，可以让`async`声明的函数看起来更像一个同步函数，也更简洁。当然，如果需要对不同的执行状态做更精细的处理还是需要用`then()`或者`catch()`方法的。
## 结论
---
本文介绍了**异步的概念**、**Promise对象**和它与**异步函数的关系**以及**async、await关键字**的含义及使用。正确使用这些基本上就算是理解了异步函数的使用，然后一些因为异步同步之间的混乱出错也就可以捋清了（大概）
